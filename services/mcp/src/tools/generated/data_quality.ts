// AUTO-GENERATED from products/data_quality/mcp/tools.yaml + OpenAPI — do not edit
import { z } from 'zod'

import type { Schemas } from '@/api/generated'
import {
    DataQualityCheckSuiteRunsCheckRunsListParams,
    DataQualityCheckSuiteRunsRetrieveParams,
    DataQualityChecksCreateBody,
    DataQualityChecksCreateQueryParams,
    DataQualityChecksDestroyParams,
    DataQualityChecksHealthRetrieveQueryParams,
    DataQualityChecksPartialUpdateBody,
    DataQualityChecksPartialUpdateParams,
    DataQualityChecksRunCreateParams,
    DataQualityChecksRunForSubjectCreateBody,
    DataQualityChecksRunsListParams,
} from '@/generated/data_quality/api'
import type { Context, ToolBase, ZodObjectAny } from '@/tools/types'

const DataQualityCheckCreateSchema = DataQualityChecksCreateQueryParams.extend(DataQualityChecksCreateBody.shape)

const dataQualityCheckCreate = (): ToolBase<typeof DataQualityCheckCreateSchema, Schemas.DataQualityCheck> => ({
    name: 'data-quality-check-create',
    schema: DataQualityCheckCreateSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckCreateSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const body: Record<string, unknown> = {}
        if (params.name !== undefined) {
            body['name'] = params.name
        }
        if (params.description !== undefined) {
            body['description'] = params.description
        }
        if (params.subject_type !== undefined) {
            body['subject_type'] = params.subject_type
        }
        if (params.subject_uuid !== undefined) {
            body['subject_uuid'] = params.subject_uuid
        }
        if (params.column_name !== undefined) {
            body['column_name'] = params.column_name
        }
        if (params.check_type !== undefined) {
            body['check_type'] = params.check_type
        }
        if (params.config !== undefined) {
            body['config'] = params.config
        }
        if (params.severity !== undefined) {
            body['severity'] = params.severity
        }
        if (params.enabled !== undefined) {
            body['enabled'] = params.enabled
        }
        if (params.tags !== undefined) {
            body['tags'] = params.tags
        }
        if (params.run_on_materialization !== undefined) {
            body['run_on_materialization'] = params.run_on_materialization
        }
        if (params.schedule_interval_minutes !== undefined) {
            body['schedule_interval_minutes'] = params.schedule_interval_minutes
        }
        if (params.created_source !== undefined) {
            body['created_source'] = params.created_source
        }
        if (params.ai_model !== undefined) {
            body['ai_model'] = params.ai_model
        }
        if (params.confidence !== undefined) {
            body['confidence'] = params.confidence
        }
        if (params.reasoning !== undefined) {
            body['reasoning'] = params.reasoning
        }
        body['created_source'] = 'ai_generated'
        const result = await context.api.request<Schemas.DataQualityCheck>({
            method: 'POST',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/`,
            body,
            query: {
                check_type: params.check_type,
                subject_type: params.subject_type,
                subject_uuid: params.subject_uuid,
            },
        })
        return result
    },
})

const DataQualityCheckDeleteSchema = DataQualityChecksDestroyParams.omit({ project_id: true })

const dataQualityCheckDelete = (): ToolBase<typeof DataQualityCheckDeleteSchema, unknown> => ({
    name: 'data-quality-check-delete',
    schema: DataQualityCheckDeleteSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckDeleteSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<unknown>({
            method: 'DELETE',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/${encodeURIComponent(String(params.id))}/`,
        })
        return result
    },
})

const DataQualityCheckResultsSchema = DataQualityChecksRunsListParams.omit({ project_id: true })

const dataQualityCheckResults = (): ToolBase<typeof DataQualityCheckResultsSchema, Schemas.DataQualityCheckRun[]> => ({
    name: 'data-quality-check-results',
    schema: DataQualityCheckResultsSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckResultsSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualityCheckRun[]>({
            method: 'GET',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/${encodeURIComponent(String(params.id))}/runs/`,
        })
        return result
    },
})

const DataQualityCheckRunSchema = DataQualityChecksRunCreateParams.omit({ project_id: true })

const dataQualityCheckRun = (): ToolBase<typeof DataQualityCheckRunSchema, Schemas.DataQualitySuiteRun> => ({
    name: 'data-quality-check-run',
    schema: DataQualityCheckRunSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckRunSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualitySuiteRun>({
            method: 'POST',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/${encodeURIComponent(String(params.id))}/run/`,
        })
        return result
    },
})

const DataQualityCheckTypesSchema = z.object({})

const dataQualityCheckTypes = (): ToolBase<typeof DataQualityCheckTypesSchema, Schemas.DataQualityCheckType[]> => ({
    name: 'data-quality-check-types',
    schema: DataQualityCheckTypesSchema,
    // eslint-disable-next-line no-unused-vars
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckTypesSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualityCheckType[]>({
            method: 'GET',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/check_types/`,
        })
        return result
    },
})

const DataQualityCheckUpdateSchema = DataQualityChecksPartialUpdateParams.omit({ project_id: true }).extend(
    DataQualityChecksPartialUpdateBody.shape
)

const dataQualityCheckUpdate = (): ToolBase<typeof DataQualityCheckUpdateSchema, Schemas.DataQualityCheck> => ({
    name: 'data-quality-check-update',
    schema: DataQualityCheckUpdateSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityCheckUpdateSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const body: Record<string, unknown> = {}
        if (params.name !== undefined) {
            body['name'] = params.name
        }
        if (params.description !== undefined) {
            body['description'] = params.description
        }
        if (params.subject_type !== undefined) {
            body['subject_type'] = params.subject_type
        }
        if (params.subject_uuid !== undefined) {
            body['subject_uuid'] = params.subject_uuid
        }
        if (params.column_name !== undefined) {
            body['column_name'] = params.column_name
        }
        if (params.check_type !== undefined) {
            body['check_type'] = params.check_type
        }
        if (params.config !== undefined) {
            body['config'] = params.config
        }
        if (params.severity !== undefined) {
            body['severity'] = params.severity
        }
        if (params.enabled !== undefined) {
            body['enabled'] = params.enabled
        }
        if (params.tags !== undefined) {
            body['tags'] = params.tags
        }
        if (params.run_on_materialization !== undefined) {
            body['run_on_materialization'] = params.run_on_materialization
        }
        if (params.schedule_interval_minutes !== undefined) {
            body['schedule_interval_minutes'] = params.schedule_interval_minutes
        }
        if (params.created_source !== undefined) {
            body['created_source'] = params.created_source
        }
        if (params.ai_model !== undefined) {
            body['ai_model'] = params.ai_model
        }
        if (params.confidence !== undefined) {
            body['confidence'] = params.confidence
        }
        if (params.reasoning !== undefined) {
            body['reasoning'] = params.reasoning
        }
        const result = await context.api.request<Schemas.DataQualityCheck>({
            method: 'PATCH',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/${encodeURIComponent(String(params.id))}/`,
            body,
        })
        return result
    },
})

const DataQualityChecksRunForSubjectSchema = DataQualityChecksRunForSubjectCreateBody

const dataQualityChecksRunForSubject = (): ToolBase<
    typeof DataQualityChecksRunForSubjectSchema,
    Schemas.DataQualitySuiteRun
> => ({
    name: 'data-quality-checks-run-for-subject',
    schema: DataQualityChecksRunForSubjectSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityChecksRunForSubjectSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const body: Record<string, unknown> = {}
        if (params.subject_type !== undefined) {
            body['subject_type'] = params.subject_type
        }
        if (params.subject_uuid !== undefined) {
            body['subject_uuid'] = params.subject_uuid
        }
        const result = await context.api.request<Schemas.DataQualitySuiteRun>({
            method: 'POST',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/run_for_subject/`,
            body,
        })
        return result
    },
})

const DataQualityHealthSchema = DataQualityChecksHealthRetrieveQueryParams

const dataQualityHealth = (): ToolBase<typeof DataQualityHealthSchema, Schemas.DataQualitySubjectHealth> => ({
    name: 'data-quality-health',
    schema: DataQualityHealthSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualityHealthSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualitySubjectHealth>({
            method: 'GET',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/checks/health/`,
            query: {
                subject_type: params.subject_type,
                subject_uuid: params.subject_uuid,
            },
        })
        return result
    },
})

const DataQualitySuiteRunSchema = DataQualityCheckSuiteRunsRetrieveParams.omit({ project_id: true })

const dataQualitySuiteRun = (): ToolBase<typeof DataQualitySuiteRunSchema, Schemas.DataQualitySuiteRun> => ({
    name: 'data-quality-suite-run',
    schema: DataQualitySuiteRunSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualitySuiteRunSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualitySuiteRun>({
            method: 'GET',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/check_suite_runs/${encodeURIComponent(String(params.id))}/`,
        })
        return result
    },
})

const DataQualitySuiteRunResultsSchema = DataQualityCheckSuiteRunsCheckRunsListParams.omit({ project_id: true })

const dataQualitySuiteRunResults = (): ToolBase<
    typeof DataQualitySuiteRunResultsSchema,
    Schemas.DataQualityCheckRun[]
> => ({
    name: 'data-quality-suite-run-results',
    schema: DataQualitySuiteRunResultsSchema,
    handler: async (context: Context, params: z.infer<typeof DataQualitySuiteRunResultsSchema>) => {
        const projectId = await context.stateManager.getProjectId()
        const result = await context.api.request<Schemas.DataQualityCheckRun[]>({
            method: 'GET',
            path: `/api/projects/${encodeURIComponent(String(projectId))}/data_quality/check_suite_runs/${encodeURIComponent(String(params.id))}/check_runs/`,
        })
        return result
    },
})

export const GENERATED_TOOLS: Record<string, () => ToolBase<ZodObjectAny>> = {
    'data-quality-check-create': dataQualityCheckCreate,
    'data-quality-check-delete': dataQualityCheckDelete,
    'data-quality-check-results': dataQualityCheckResults,
    'data-quality-check-run': dataQualityCheckRun,
    'data-quality-check-types': dataQualityCheckTypes,
    'data-quality-check-update': dataQualityCheckUpdate,
    'data-quality-checks-run-for-subject': dataQualityChecksRunForSubject,
    'data-quality-health': dataQualityHealth,
    'data-quality-suite-run': dataQualitySuiteRun,
    'data-quality-suite-run-results': dataQualitySuiteRunResults,
}
