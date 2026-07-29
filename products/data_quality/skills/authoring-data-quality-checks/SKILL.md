---
name: authoring-data-quality-checks
description: >
  Adds and runs data quality checks (dbt-test style assertions) on a project's warehouse tables and
  saved-query views: not-null, uniqueness, accepted values, referential integrity, row-count bounds,
  freshness, and custom HogQL. Use when asked to test a model, validate a view, check for nulls or
  duplicates, add data quality checks, find out why a number looks wrong, or judge whether a warehouse
  table is trustworthy before using it in an analysis. To describe what data *means* (metrics,
  certifications, joins), see setting-up-data-catalog instead. Trigger terms: data quality, data test,
  dbt test, not null check, uniqueness check, freshness check, referential integrity, row count check,
  validate model, is this table trustworthy.
---

# Authoring data quality checks

A check is one assertion about one warehouse table or view. It compiles to a count-only HogQL query
and **passes when it finds zero failing rows** — the same semantics as `dbt test`. Failing rows are
never stored; only counts and the compiled query are, so to see the offending rows you re-run the
stored query yourself.

Reads go through SQL (`system.information_schema.data_quality_*`); writes and runs go through the
data-quality MCP tools.

## Before you write anything: look

Two queries save you from the two most common mistakes — duplicating a check, and checking a column
that doesn't exist.

```sql
-- What is already covered?
SELECT name, subject_name, column_name, check_type, config, severity, last_status
FROM system.information_schema.data_quality_checks
WHERE subject_name = 'orders'

-- What columns are there, and what do they mean?
SELECT column_name, data_type, description
FROM system.information_schema.columns
WHERE table_name = 'orders'
```

Re-creating a byte-identical check is a harmless no-op — checks are keyed by a fingerprint of the
subject, type, column, and config, so an identical create upserts. A _near_-duplicate is not
harmless: it doubles the noise for whoever reads the results. If an existing check is close but
wrong, update or delete it rather than adding a sibling.

## Choosing checks

Aim for a handful that would actually catch a real regression, not blanket coverage. A model with
twenty checks nobody reads is worse than three that fail meaningfully.

Reach for these first, in roughly this order:

- **`not_null` on the columns downstream joins and filters depend on.** The single highest-value
  check. A null join key silently drops rows.
- **`unique` on whatever the model claims is its grain.** If `orders` is one row per order, say so.
- **`relationships` on foreign keys.** Catches the join that quietly stopped matching after an
  upstream change.
- **`accepted_values` on status and category columns** whose downstream logic branches on them.
- **`freshness` on the timestamp column of anything that syncs.** Catches a dead pipeline, which no
  row-level check will.
- **`row_count` bounds** when you know the plausible range. Good for catching a truncated sync.
- **`custom_sql`** only when nothing above expresses the invariant — e.g. cross-column arithmetic
  (`select 1 from orders where total != subtotal + tax`). Every row it returns counts as a failure.

Call `posthog:data-quality-check-types` for each type's exact config schema rather than guessing.

## Severity and triggers

**Severity** is a decision about consequences, not about confidence. Use `error` when the failure
means downstream numbers should not be trusted — those failures mark the subject `failing` and
notify. Use `warn` for things worth surfacing that nobody would act on today. When unsure, `warn` is
the safer default: an `error` check that cries wolf gets everything ignored.

**Triggers** — a check runs when something asks it to, and by default that is only materialization:

- Views get `run_on_materialization` on by default. Leave it on; it costs nothing when the model
  isn't rebuilt, and it never delays or fails the materialization itself.
- **Source tables are not materialized, so nothing triggers their checks.** Set
  `schedule_interval_minutes` on those, and on freshness checks generally — a freshness check with
  no schedule can only ever tell you the data was fresh at the last rebuild.

## Verify what you wrote

Author, run once, read the result. A check nobody has run is a guess.

1. `posthog:data-quality-check-create`
2. `posthog:data-quality-check-run` — returns a suite run
3. `posthog:data-quality-suite-run` until status leaves `running`
4. `posthog:data-quality-suite-run-results` for the per-check outcomes

A `failed` result on the first run is the interesting case: either you found real bad data, or the
assertion is wrong. Take the `compiled_query` off the run, execute it with `posthog:execute-sql`, and
look at what it actually matched before reporting anything. An `errored` result is never a data
problem — the query could not run at all, usually a column name typo or a subject that no longer
exists.

## Judging a source before you use it

When an analysis depends on a warehouse table or view, check its verdict first:

```sql
SELECT subject_name, health, checks_total, checks_failing, last_run_at
FROM system.information_schema.data_quality_health
```

- `failing` — an error-severity check found bad data. Say so in your answer; don't quietly use it.
- `erroring` — a check couldn't run. The data may be fine, but nobody is watching it.
- `warn` — only warn-severity failures. Usable, worth a mention.
- `healthy` — checks ran and passed.
- `unknown` / absent — no checks, or none have run. Absence of failures is not evidence of health.

For the history behind a verdict, `system.information_schema.data_quality_check_runs` carries recent
executions with `observed_value` recorded on passes too, so you can see when a number started
drifting rather than just that it is wrong now.

## Related

- `setting-up-data-catalog` — what the data _means_: metrics, trust marks, relationships.
- `querying-posthog-data` — the schema-discovery and HogQL rules these queries follow.
