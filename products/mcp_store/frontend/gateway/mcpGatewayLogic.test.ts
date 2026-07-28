import { MOCK_DEFAULT_BASIC_USER, MOCK_DEFAULT_TEAM } from '~/lib/api.mock'

import { lemonToast } from '@posthog/lemon-ui'

import { initKeaTests } from '~/test/init'
import { expectLogic } from '~/test/keaTestUtils'

import {
    mcpGatewayConfigApplyPresetCreate,
    mcpGatewayConfigList,
    mcpGatewayMembersList,
    mcpGatewayRulesList,
    mcpGatewayServersList,
    mcpGatewayServersPartialUpdate,
    mcpGatewayServiceAccountsList,
    mcpServerInstallationsInstallCustomCreate,
    mcpServerInstallationsInstallTemplateCreate,
} from '../generated/api'
import type { GatewayMemberSummaryApi, MCPGatewayServerApi } from '../generated/api.schemas'
import { GATEWAY_MEMBERS_PAGE_SIZE, mcpGatewayLogic } from './mcpGatewayLogic'

jest.mock('../generated/api', () => ({
    mcpGatewayConfigApplyPresetCreate: jest.fn(),
    mcpGatewayConfigList: jest.fn(),
    mcpGatewayMembersList: jest.fn(),
    mcpGatewayRulesList: jest.fn(),
    mcpGatewayServersList: jest.fn(),
    mcpGatewayServersPartialUpdate: jest.fn(),
    mcpGatewayServiceAccountsList: jest.fn(),
    mcpServerInstallationsInstallCustomCreate: jest.fn(),
    mcpServerInstallationsInstallTemplateCreate: jest.fn(),
}))

const mockApplyPreset = mcpGatewayConfigApplyPresetCreate as jest.MockedFunction<
    typeof mcpGatewayConfigApplyPresetCreate
>
const mockConfigList = mcpGatewayConfigList as jest.MockedFunction<typeof mcpGatewayConfigList>
const mockMembersList = mcpGatewayMembersList as jest.MockedFunction<typeof mcpGatewayMembersList>
const mockRulesList = mcpGatewayRulesList as jest.MockedFunction<typeof mcpGatewayRulesList>
const mockServersList = mcpGatewayServersList as jest.MockedFunction<typeof mcpGatewayServersList>
const mockServersPartialUpdate = mcpGatewayServersPartialUpdate as jest.MockedFunction<
    typeof mcpGatewayServersPartialUpdate
>
const mockServiceAccountsList = mcpGatewayServiceAccountsList as jest.MockedFunction<
    typeof mcpGatewayServiceAccountsList
>
const mockInstallCustom = mcpServerInstallationsInstallCustomCreate as jest.MockedFunction<
    typeof mcpServerInstallationsInstallCustomCreate
>
const mockInstallTemplate = mcpServerInstallationsInstallTemplateCreate as jest.MockedFunction<
    typeof mcpServerInstallationsInstallTemplateCreate
>

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise
    })
    return { promise, resolve }
}

function apiError(detail: string): Error & { detail: string } {
    return Object.assign(new Error(detail), { detail })
}

function gatewayServer(overrides: Partial<MCPGatewayServerApi>): MCPGatewayServerApi {
    return {
        id: 'server-id',
        name: 'Test server',
        url: 'https://mcp.example.com/mcp',
        description: '',
        category: 'dev',
        auth_mode: 'individual',
        template_auth_type: null,
        is_team_enabled: true,
        allow_personal_connections: true,
        icon_key: '',
        icon_domain: '',
        docs_url: '',
        template_id: null,
        tool_count: 0,
        connections: [],
        your_connection: null,
        shared_credential: null,
        agents: [],
        revoked_user_ids: [],
        is_revoked_for_you: false,
        created_by: {
            id: MOCK_DEFAULT_BASIC_USER.id,
            uuid: MOCK_DEFAULT_BASIC_USER.uuid,
            distinct_id: MOCK_DEFAULT_BASIC_USER.distinct_id,
            first_name: MOCK_DEFAULT_BASIC_USER.first_name,
            email: MOCK_DEFAULT_BASIC_USER.email,
            hedgehog_config: null,
        },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    }
}

function gatewayMember(userId: number): GatewayMemberSummaryApi {
    return {
        user: {
            id: userId,
            uuid: `user-${userId}`,
            first_name: 'Test',
            last_name: 'Member',
            email: `member-${userId}@example.com`,
            hedgehog_config: null,
        },
        is_org_admin: false,
        connected_server_ids: [],
        revoked_server_ids: [],
    }
}

describe('mcpGatewayLogic', () => {
    let logic: ReturnType<typeof mcpGatewayLogic.build>

    beforeEach(async () => {
        initKeaTests()
        jest.resetAllMocks()
        mockConfigList.mockResolvedValue({ is_admin: true, allow_custom_servers: true })
        mockMembersList.mockResolvedValue({ count: 0, results: [] })
        mockRulesList.mockResolvedValue({ count: 0, results: [] })
        mockServersList.mockResolvedValue({ count: 0, results: [] })
        mockServiceAccountsList.mockResolvedValue({ count: 0, results: [] })
        mockInstallCustom.mockResolvedValue({ redirect_url: '' })
        mockInstallTemplate.mockResolvedValue({ redirect_url: '' })

        logic = mcpGatewayLogic()
        logic.mount()
        await expectLogic(logic).toFinishAllListeners()
    })

    afterEach(() => {
        logic.unmount()
        jest.restoreAllMocks()
    })

    it('connects a custom API-key server with the selected auth type and credential', async () => {
        const server = gatewayServer({ id: 'custom-server' })
        logic.actions.loadServersSuccess([server])
        logic.actions.connectServer(server.id)
        logic.actions.setConnectionAuthType('api_key')
        logic.actions.setConnectionApiKey('sk-custom')

        await expectLogic(logic, () => {
            logic.actions.submitConnection()
        }).toFinishAllListeners()

        expect(mockInstallCustom).toHaveBeenCalledWith(
            String(MOCK_DEFAULT_TEAM.id),
            expect.objectContaining({
                name: server.name,
                url: server.url,
                auth_type: 'api_key',
                api_key: 'sk-custom',
                scope: 'personal',
            })
        )
    })

    it('passes the entered API key when connecting a catalog template', async () => {
        const server = gatewayServer({
            id: 'template-server',
            template_id: 'template-id',
            template_auth_type: 'api_key',
        })
        logic.actions.loadServersSuccess([server])
        logic.actions.connectServer(server.id)
        logic.actions.setConnectionApiKey('sk-template')

        await expectLogic(logic, () => {
            logic.actions.submitConnection()
        }).toFinishAllListeners()

        expect(mockInstallTemplate).toHaveBeenCalledWith(
            String(MOCK_DEFAULT_TEAM.id),
            expect.objectContaining({
                template_id: server.template_id,
                api_key: 'sk-template',
                scope: 'personal',
            })
        )
    })

    it('does not connect an API-key server without a key', () => {
        const server = gatewayServer({ id: 'custom-server' })
        logic.actions.loadServersSuccess([server])
        logic.actions.connectServer(server.id)
        logic.actions.setConnectionAuthType('api_key')

        logic.actions.submitConnection()

        expect(logic.values.connectionSubmitDisabledReason).toBe('Enter an API key to connect this server.')
        expect(mockInstallCustom).not.toHaveBeenCalled()
    })

    it('does not start a second OAuth connection while the first is in flight', async () => {
        const pendingInstall = deferred<Awaited<ReturnType<typeof mcpServerInstallationsInstallTemplateCreate>>>()
        mockInstallTemplate.mockReturnValue(pendingInstall.promise)
        const server = gatewayServer({
            id: 'oauth-template-server',
            template_id: 'template-id',
            template_auth_type: 'oauth',
        })
        logic.actions.loadServersSuccess([server])

        logic.actions.connectServer(server.id)
        logic.actions.connectServer(server.id)

        expect(mockInstallTemplate).toHaveBeenCalledTimes(1)

        pendingInstall.resolve({ redirect_url: '' })
        await expectLogic(logic).toFinishAllListeners()
    })

    it('surfaces access update failures and clears the loading state', async () => {
        const server = gatewayServer({ is_team_enabled: true })
        const toast = jest.spyOn(lemonToast, 'error')
        mockServersPartialUpdate.mockRejectedValue(apiError('You cannot update this server.'))
        logic.actions.loadServersSuccess([server])

        await expectLogic(logic, () => {
            logic.actions.toggleServerEnabled(server.id, false)
        }).toFinishAllListeners()

        expect(toast).toHaveBeenCalledWith('You cannot update this server.')
        expect(logic.values.serverEnabledLoadingIds).toEqual(new Set())
        expect(logic.values.servers[0].is_team_enabled).toBe(true)
    })

    it('reloads servers after a bulk update partially fails', async () => {
        const updatedServer = gatewayServer({ id: 'updated-server', is_team_enabled: true })
        const failedServer = gatewayServer({ id: 'failed-server', is_team_enabled: true })
        const slowUpdate = deferred<Awaited<ReturnType<typeof mcpGatewayServersPartialUpdate>>>()
        mockServersPartialUpdate.mockImplementation((_projectId, serverId) => {
            if (serverId === failedServer.id) {
                return Promise.reject(apiError('Could not update every server.'))
            }
            return slowUpdate.promise
        })
        mockServersList.mockClear()
        mockServersList.mockResolvedValue({
            count: 2,
            results: [{ ...updatedServer, is_team_enabled: false }, failedServer],
        })
        logic.actions.loadServersSuccess([updatedServer, failedServer])

        logic.actions.setAllServersEnabled(false)
        await Promise.resolve()

        expect(mockServersPartialUpdate).toHaveBeenCalledTimes(2)
        expect(mockServersList).not.toHaveBeenCalled()
        expect(logic.values.allServersEnabledLoading).toBe(true)
        slowUpdate.resolve({ ...updatedServer, is_team_enabled: false })
        await expectLogic(logic).toFinishAllListeners()
        expect(mockServersList).toHaveBeenCalledTimes(1)
        expect(logic.values.allServersEnabledLoading).toBe(false)
        expect(logic.values.servers).toEqual([{ ...updatedServer, is_team_enabled: false }, failedServer])
    })

    it('tracks preset updates by audience and uses the mutation response', async () => {
        const pendingPreset = deferred<Awaited<ReturnType<typeof mcpGatewayConfigApplyPresetCreate>>>()
        const updatedConfig = {
            ...logic.values.config!,
            member_default_preset: 'block' as const,
        }
        mockApplyPreset.mockReturnValue(pendingPreset.promise)
        const configLoadCalls = mockConfigList.mock.calls.length

        logic.actions.applyPreset('members', 'block')
        logic.actions.applyPreset('agents', 'allow')

        expect(logic.values.applyingPresetByAudience).toEqual({ members: 'block' })
        expect(mockApplyPreset).toHaveBeenCalledTimes(1)

        pendingPreset.resolve(updatedConfig)
        await expectLogic(logic).toFinishAllListeners()

        expect(logic.values.applyingPresetByAudience).toEqual({})
        expect(logic.values.config).toEqual(updatedConfig)
        expect(mockConfigList).toHaveBeenCalledTimes(configLoadCalls)
    })

    it('loads members one server-controlled page at a time', async () => {
        const secondPageMember = gatewayMember(101)
        mockMembersList.mockResolvedValue({ count: 101, results: [secondPageMember] })

        await expectLogic(logic, () => {
            logic.actions.setMembersOffset(GATEWAY_MEMBERS_PAGE_SIZE)
        }).toFinishAllListeners()

        expect(mockMembersList).toHaveBeenLastCalledWith(String(MOCK_DEFAULT_TEAM.id), {
            limit: GATEWAY_MEMBERS_PAGE_SIZE,
            offset: GATEWAY_MEMBERS_PAGE_SIZE,
        })
        expect(logic.values.memberCount).toBe(101)
        expect(logic.values.members).toEqual([secondPageMember])
    })
})
