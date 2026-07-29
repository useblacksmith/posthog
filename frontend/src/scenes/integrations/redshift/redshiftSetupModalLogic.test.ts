import { expectLogic } from 'kea-test-utils'

import apiReal from 'lib/api'

import { useMocks } from '~/mocks/jest'
import { initKeaTests } from '~/test/init'

import { redshiftSetupModalLogic } from './redshiftSetupModalLogic'

describe('redshiftSetupModalLogic', () => {
    let logic: ReturnType<typeof redshiftSetupModalLogic.build>
    let createSpy: jest.SpyInstance

    useMocks({
        get: {
            '/api/environments/:team_id/integrations/': () => [200, { results: [] }],
        },
    })

    beforeEach(() => {
        initKeaTests()
        logic = redshiftSetupModalLogic({ isOpen: true, onComplete: jest.fn() })
        logic.mount()
        createSpy = jest.spyOn(apiReal.integrations, 'create').mockResolvedValue({
            id: 42,
            kind: 'redshift',
            display_name: 'my connection',
            icon_url: '',
            config: {},
            created_at: '2026-07-13T00:00:00Z',
        } as any)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('sends connection credentials in password mode', async () => {
        await expectLogic(logic, () => {
            logic.actions.setRedshiftIntegrationValues({
                name: 'my connection',
                host: 'example-redshift.abc123.us-east-1.redshift.amazonaws.com',
                port: 5439,
                user: 'batch_exporter',
                password: 'secret',
            })
            logic.actions.submitRedshiftIntegration()
        }).toFinishAllListeners()

        expect(createSpy).toHaveBeenCalledWith({
            kind: 'redshift',
            config: {
                name: 'my connection',
                authentication_type: 'password',
                host: 'example-redshift.abc123.us-east-1.redshift.amazonaws.com',
                port: 5439,
                user: 'batch_exporter',
                password: 'secret',
            },
        })
    })

    it('sends serverless IAM role fields in IAM role mode', async () => {
        await expectLogic(logic, () => {
            logic.actions.setAuthMode('iam_role')
            logic.actions.setRedshiftIntegrationValues({
                name: 'my connection',
                region: 'us-east-1',
                workgroupName: 'analytics-workgroup',
                awsRoleArn: 'arn:aws:iam::123456789012:role/posthog-redshift',
            })
            logic.actions.submitRedshiftIntegration()
        }).toFinishAllListeners()

        expect(createSpy).toHaveBeenCalledWith({
            kind: 'redshift',
            config: {
                name: 'my connection',
                authentication_type: 'iam_role',
                region: 'us-east-1',
                workgroup_name: 'analytics-workgroup',
                aws_role_arn: 'arn:aws:iam::123456789012:role/posthog-redshift',
            },
        })
    })

    it.each(['', 'not-an-arn', 'arn:aws:iam::123:role/too-short-account'])(
        'does not submit in IAM role mode with invalid ARN %p',
        async (awsRoleArn) => {
            await expectLogic(logic, () => {
                logic.actions.setAuthMode('iam_role')
                logic.actions.setRedshiftIntegrationValues({
                    name: 'my connection',
                    region: 'us-east-1',
                    workgroupName: 'analytics-workgroup',
                    awsRoleArn,
                })
                logic.actions.submitRedshiftIntegration()
            }).toFinishAllListeners()

            expect(createSpy).not.toHaveBeenCalled()
        }
    )

    it('clears auth-specific fields when switching auth mode', async () => {
        await expectLogic(logic, () => {
            logic.actions.setRedshiftIntegrationValues({
                name: 'my connection',
                host: 'example-redshift.abc123.us-east-1.redshift.amazonaws.com',
                user: 'batch_exporter',
                password: 'secret',
            })
            logic.actions.setAuthMode('iam_role')
        }).toFinishAllListeners()

        expect(logic.values.redshiftIntegration).toMatchObject({
            name: 'my connection',
            host: '',
            user: '',
            password: '',
            workgroupName: '',
            awsRoleArn: '',
        })
    })
})
