// plugin.ts

import axios from 'axios';
import process from 'process';
import webito from 'webito-plugin-sdk'

const starter = new webito.WebitoPlugin('starter');

starter.registerHook(
    webito.hooks.paymentsCreate,
    async ({ vars, data }: any) => {
        const inputdata = {
            "merchant": vars.merchant,
            "amount": data.amount * 10,
            "callbackUrl": data.callback,
            "description": data.payment,
        }
        const create = await axios.post('https://gateway.zibal.ir/v1/request', inputdata)
        if (create.data.trackId) {
            return {
                status: true,
                data: {
                    transaction: create.data,
                    url: 'https://gateway.zibal.ir/start/' + create.data.trackId
                }
            }
        } else {
            return {
                status: false,
            }
        }
    });

starter.registerHook(
    webito.hooks.paymentsVerify,
    async ({ vars, data }: any) => {
        const inputdata = {
            "merchant": vars.merchant,
            "trackId": data.payment.transaction.transaction.trackId,
        }
        const verify = await axios.post('https://gateway.zibal.ir/v1/verify', inputdata)

        if (verify.data.status == 1) {
            return {
                status: true,
            }
        } else {
            return {
                status: false,
            }
        }
    });

const runPlugin = async (inputData: { hook: string; data: any }) => {
    const result = await starter.executeHook(inputData.hook, inputData.data);
    return result;
};


process.stdin.on('data', async (input) => {
    const msg = JSON.parse(input.toString());
    const result: any = await runPlugin(msg);
    starter.response({ status: result?.status, data: result?.data })
});