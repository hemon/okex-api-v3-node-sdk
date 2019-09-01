// tslint:disable:variable-name
import axios from 'axios';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
export function AuthenticatedClient(key, secret, passphrase, apiUri = 'https://www.okex.com', timeout = 3000, axiosConfig = {}) {
    const axiosInstance = axios.create({
        baseURL: apiUri,
        timeout,
        ...axiosConfig
    });
    const signRequest = (method, path, options = {}) => {
        // tslint:disable:no-if-statement
        // tslint:disable:no-let
        // tslint:disable:no-expression-statement
        const timestamp = Date.now() / 1000;
        const what = timestamp + method.toUpperCase() + path + (options.body || '');
        const hmac = crypto.createHmac('sha256', secret);
        const signature = hmac.update(what).digest('base64');
        return {
            key,
            passphrase,
            signature,
            timestamp
        };
    };
    const getSignature = (method, relativeURI, opts = {}) => {
        const sig = signRequest(method, relativeURI, opts);
        return {
            'OK-ACCESS-KEY': sig.key,
            'OK-ACCESS-PASSPHRASE': sig.passphrase,
            'OK-ACCESS-SIGN': sig.signature,
            'OK-ACCESS-TIMESTAMP': sig.timestamp
        };
    };
    async function get(url, params) {
        return axiosInstance
            .get(url, { params, headers: { ...getSignature('get', url) } })
            .then(res => res.data)
            .catch(error => {
            console.log(error.response && error.response !== undefined && error.response.data
                ? JSON.stringify(error.response.data)
                : error);
            console.log(error.message ? error.message : `${url} error`);
            throw error;
        });
    }
    async function post(url, body, params) {
        const bodyJson = JSON.stringify(body);
        return axiosInstance
            .post(url, body, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                ...getSignature('post', url, { body: bodyJson })
            },
            params
        })
            .then(res => res.data)
            .catch(error => {
            console.log(error.response && error.response !== undefined && error.response.data
                ? JSON.stringify(error.response.data)
                : error);
            console.log(error.message ? error.message : `${url} error`);
            throw error;
        });
    }
    async function del(url, body, params) {
        const bodyJson = JSON.stringify(body);
        return axiosInstance
            .post(url, body, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                ...getSignature('delete', url, { body: bodyJson })
            },
            params
        })
            .then(res => res.data)
            .catch(error => {
            console.log(error.response && error.response !== undefined && error.response.data
                ? JSON.stringify(error.response.data)
                : error);
            console.log(error.message ? error.message : `${url} error`);
            throw error;
        });
    }
    return {
        spot() {
            return {
                async getAccounts(currency) {
                    return currency
                        ? get(`/api/spot/v3/accounts/${currency}`)
                        : get('/api/spot/v3/accounts');
                },
                async getLedger(currency) {
                    return get(`/api/spot/v3/accounts/${currency}/ledger`);
                },
                async postOrder(params) {
                    return post('/api/spot/v3/orders', params);
                },
                async postBatchOrders(params) {
                    return post('/api/spot/v3/batch_orders', params);
                },
                async postCancelOrder(order_id, params) {
                    return post(`/api/spot/v3/cancel_orders/${order_id}`, params);
                },
                async postCancelBatchOrders(params) {
                    return post(`/api/spot/v3/cancel_batch_orders`, params);
                },
                async getOrders(params) {
                    return get(`/api/spot/v3/orders?` + querystring.stringify(params));
                },
                async getOrdersPending(params) {
                    return get(`/api/spot/v3/orders_pending${params ? `?${querystring.stringify(params)}` : ''}`);
                },
                async getOrder(order_id, params) {
                    return get(`/api/spot/v3/orders/${order_id}?` + querystring.stringify(params));
                },
                async getFills(params) {
                    return get(`/api/spot/v3/fills?${querystring.stringify(params)}`);
                }
            };
        },
        account() {
            return {
                async getCurrencies() {
                    return get('/api/account/v3/currencies');
                },
                async getWithdrawalFee(currency) {
                    return get(`/api/account/v3/withdrawal/fee${currency ? `?currency=${currency}` : ''}`);
                },
                async getWallet(currency) {
                    return get(`/api/account/v3/wallet${currency ? `/${currency}` : ''}`);
                },
                async postTransfer(params) {
                    return post('/api/account/v3/transfer', params);
                },
                async postWithdrawal(params) {
                    return post('/api/account/v3/withdrawal', params);
                },
                async getWithdrawalHistory(currency) {
                    return get(`/api/account/v3/withdrawal/history${currency ? `/${currency}` : ''}`);
                },
                async getLedger(params) {
                    return get(`/api/account/v3/ledger${params ? `?${querystring.stringify(params)}` : ''}`);
                },
                async getAddress(currency) {
                    return get(`/api/account/v3/deposit/address${currency ? `?currency=${currency}` : ''}`);
                },
                async getDepositHistory(currency) {
                    return get(`/api/account/v3/deposit/history${currency ? `/${currency}` : ''}`);
                }
            };
        },
        margin() {
            return {
                async getAccounts(instrument_id) {
                    return instrument_id
                        ? get(`/api/margin/v3/accounts/${instrument_id}`)
                        : get('/api/margin/v3/accounts');
                },
                async getLedger(instrument_id) {
                    return get(`/api/margin/v3/accounts/${instrument_id}/ledger`);
                },
                async getAvailability(instrument_id) {
                    return instrument_id
                        ? get(`/api/margin/v3/accounts/${instrument_id}/availability`)
                        : get(`/api/margin/v3/accounts/availability`);
                },
                async getborrowed(instrument_id, params) {
                    return instrument_id
                        ? get(`/api/margin/v3/accounts/${instrument_id}/borrowed${params ? `?${querystring.stringify(params)}` : ''}`)
                        : get(`/api/margin/v3/accounts/borrowed${params ? `?${querystring.stringify(params)}` : ''}`);
                },
                async postBorrow(params) {
                    return post(`/api/margin/v3/accounts/borrow`, params);
                },
                async postRepayment(params) {
                    return post(`/api/margin/v3/accounts/repayment`, params);
                },
                async postOrder(params) {
                    return post(`/api/margin/v3/orders`, params);
                },
                async postBatchOrder(params) {
                    return post(`/api/margin/v3/batch_orders`, params);
                },
                async postCancelOrder(order_id, params) {
                    return post(`/api/margin/v3/cancel_orders/${order_id}`, params);
                },
                async postCancelBatchOrders(params) {
                    return post(`/api/margin/v3/cancel_batch_orders`, params);
                },
                async getOrders(params) {
                    return get(`/api/margin/v3/orders?` + querystring.stringify(params));
                },
                async getOrder(order_id, instrument_id) {
                    return get(`/api/margin/v3/orders/${order_id}${instrument_id ? `?instrument_id=${instrument_id}` : ''}`);
                },
                async getOrdersPending(params) {
                    return get(`/api/margin/v3/orders_pending${params ? `?${querystring.stringify(params)}` : ''}`);
                },
                async getFills(params) {
                    return get(`/api/margin/v3/fills?${querystring.stringify(params)}`);
                }
            };
        },
        futures() {
            return {
                async getPosition(instrument_id) {
                    return get(`/api/futures/v3${instrument_id ? `/${instrument_id}` : ''}/position`);
                },
                async getAccounts(currency) {
                    return get(`/api/futures/v3/accounts${currency ? `/${currency}` : ''}`);
                },
                async getLeverage(currency) {
                    return get(`/api/futures/v3/accounts/${currency}/leverage`);
                },
                async postLeverage(currency, params) {
                    return post(`/api/futures/v3/accounts/${currency}/leverage`, params);
                },
                async getAccountsLedger(currency, params) {
                    return get(`/api/futures/v3/accounts/${currency}/ledger${params ? `?${querystring.stringify(params)}` : ''}`);
                },
                async postOrder(params) {
                    return post('/api/futures/v3/order', params);
                },
                async postOrders(params) {
                    return post('/api/futures/v3/orders', params);
                },
                async cancelOrder(instrument_id, order_id) {
                    return post(`/api/futures/v3/cancel_order/${instrument_id}/${order_id}`);
                },
                async cancelBatchOrders(instrument_id, params) {
                    return post(`/api/futures/v3/cancel_batch_orders/${instrument_id}`, params);
                },
                async getOrders(instrument_id, params) {
                    return get(`/api/futures/v3/orders/${instrument_id}?${querystring.stringify(params)}`);
                },
                async getOrder(instrument_id, order_id) {
                    return get(`/api/futures/v3/orders/${instrument_id}/${order_id}`);
                },
                async getFills(params) {
                    return get(`/api/futures/v3/fills?${querystring.stringify(params)}`);
                },
                async getHolds(instrument_id) {
                    return get(`/api/futures/v3/accounts/${instrument_id}/holds`);
                },
                async postMarginMode(params) {
                    return post(`/api/futures/v3/accounts/margin_mode`, params);
                },
                async postOrderAlgo(params) {
                    return post(`/api/futures/v3/order_algo`, params);
                },
                async getOrderAlgo(instrument_id, params) {
                    return get(`/api/futures/v3/order_algo/${instrument_id}?${querystring.stringify(params)}`);
                },
                async postCancleAlgos(params) {
                    return post(`/api/futures/v3/cancel_algos`, params);
                },
            };
        },
        swap() {
            return {
                async getPosition(instrument_id) {
                    return get(`/api/swap/v3/${instrument_id}/position`);
                },
                async getAccount(instrument_id) {
                    return get(`/api/swap/v3${instrument_id ? `/${instrument_id}` : ''}/accounts`);
                },
                async getSettings(instrument_id) {
                    return get(`/api/swap/v3/accounts/${instrument_id}/settings`);
                },
                async postLeverage(instrument_id, params) {
                    return post(`/api/swap/v3/accounts/${instrument_id}/leverage`, params);
                },
                async getLedger(instrument_id) {
                    return get(`/api/swap/v3/accounts/${instrument_id}/ledger`);
                },
                async postOrder(params) {
                    return post('/api/swap/v3/order', params);
                },
                async postBatchOrder(params) {
                    return post('/api/swap/v3/orders', params);
                },
                async postCancelOrder(instrument_id, order_id) {
                    return post(`/api/swap/v3/cancel_order/${instrument_id}/${order_id}`);
                },
                async postCancelBatchOrder(instrument_id, params) {
                    return post(`/api/swap/v3/cancel_batch_orders/${instrument_id}`, params);
                },
                async getOrders(instrument_id, params) {
                    return get(`/api/swap/v3/orders/${instrument_id}?` +
                        querystring.stringify(params));
                },
                async getOrder(instrument_id, order_id) {
                    return get(`/api/swap/v3/orders/${instrument_id}/${order_id}`);
                },
                async getHolds(instrument_id) {
                    return get(`/api/swap/v3/accounts/${instrument_id}/holds`);
                },
                async getFills(params) {
                    return get(`/api/swap/v3/fills?${querystring.stringify(params)}`);
                }
            };
        },
        ett() {
            return {
                getAccounts(currency) {
                    return get(`/api/ett/v3/accounts${currency ? `/${currency}` : ''}`);
                },
                getAccountsLedger(currency) {
                    return get(`/api/ett/v3/accounts/${currency}/ledger`);
                },
                postOrder(params) {
                    return post('/api/ett/v3/orders', params);
                },
                deleteOrder(order_id) {
                    return del(`/api/ett/v3/orders/${order_id}`);
                },
                getOrders(params) {
                    return get(`/api/ett/v3/orders?${querystring.stringify(params)}`);
                },
                getOrder(order_id) {
                    return get(`/api/ett/v3/orders/${order_id}`);
                }
            };
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aGVudGljYXRlZENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvQXV0aGVudGljYXRlZENsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFFL0IsT0FBTyxLQUF3QixNQUFNLE9BQU8sQ0FBQztBQUM3QyxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUNqQyxPQUFPLEtBQUssV0FBVyxNQUFNLGFBQWEsQ0FBQztBQUUzQyxNQUFNLFVBQVUsbUJBQW1CLENBQ2pDLEdBQVcsRUFDWCxNQUFjLEVBQ2QsVUFBa0IsRUFDbEIsTUFBTSxHQUFHLHNCQUFzQixFQUMvQixPQUFPLEdBQUcsSUFBSSxFQUNkLFdBQVcsR0FBRyxFQUFFO0lBRWhCLE1BQU0sYUFBYSxHQUFrQixLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hELE9BQU8sRUFBRSxNQUFNO1FBQ2YsT0FBTztRQUNQLEdBQUcsV0FBVztLQUNmLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLENBQ2xCLE1BQWMsRUFDZCxJQUFZLEVBQ1osVUFBNEQsRUFBRSxFQUM5RCxFQUFFO1FBQ0YsaUNBQWlDO1FBQ2pDLHdCQUF3QjtRQUN4Qix5Q0FBeUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNwQyxNQUFNLElBQUksR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFDNUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsT0FB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