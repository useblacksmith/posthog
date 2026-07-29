"""Tell the team when a model starts failing its checks.

Only the pass-to-fail edge notifies, and only for error-severity checks. A check that keeps failing
run after run is already known about; re-notifying every run is how an inbox gets ignored.
"""

import structlog

from products.notifications.backend.facade.api import (
    NotificationData,
    NotificationType,
    Priority,
    TargetType,
    create_notification,
)

from ..models import DataQualityCheck

LOGGER = structlog.get_logger(__name__)


def notify_check_started_failing(check: DataQualityCheck, failed_row_count: int | None) -> None:
    """Best-effort: a notification failure must never take down the run that produced it."""
    try:
        create_notification(
            NotificationData(
                team_id=check.team_id,
                notification_type=NotificationType.DATA_QUALITY_CHECK_FAILURE,
                priority=Priority.NORMAL,
                title=f"Data quality check failed on {check.subject_name}",
                body=_body(check, failed_row_count),
                target_type=TargetType.TEAM,
                target_id=str(check.team_id),
                # The body names a warehouse table or view and one of its columns, so recipients are
                # filtered to members who can see warehouse objects at all. Without this every team
                # member gets schema they may be denied everywhere else.
                resource_type="warehouse_objects",
                resource_id=str(check.id),
            )
        )
    except Exception:
        LOGGER.exception("Could not send a data quality failure notification", check_id=str(check.id))


def _body(check: DataQualityCheck, failed_row_count: int | None) -> str:
    subject = f"{check.check_type} check"
    if check.column_name:
        subject = f"{check.check_type} check on {check.subject_name}.{check.column_name}"

    if failed_row_count:
        rows = "row" if failed_row_count == 1 else "rows"
        return f"The {subject} found {failed_row_count} failing {rows}. It was passing on the previous run."
    return f"The {subject} started failing. It was passing on the previous run."
