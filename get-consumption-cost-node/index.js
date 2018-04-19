// An HTTP trigger Azure Function that returns billing consumption
var BillingCostCalculator = require('../common/billingCostCalculator');
var AppInsightsUtil = require('../common/appInsights');

function getCreds() {
    return {
        clientId: process.env['clientId'],
        clientSecret: process.env['clientSecret'],
        tenantId: process.env['tenantId'],
        offerId: process.env['offerId'],
        subscriptionId: process.env['subscriptionId']
    }
}

function getParams(req) {
    return {
        filter: req.body && req.body.filter ? req.body : '',
        granularity: req.body && req.body.granularity ? req.body.granularity : 'Daily',
        startDate: req.body && req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body && req.body.endDate ? new Date(req.body.endDate) : null,
        detailed: req.body && req.body.detailed ? req.body.detailed == 'true' : false
    }
}

module.exports = function (context, req) {

    //
    // Generate a transaction ID for this call
    //
    const uuidv4 = require('uuid/v4')
    var trnId = uuidv4();

    //
    // Setup AppInsights
    //
    var appInsights = new AppInsightsHelper("get-consumption-cost-node", trnId);
    appInsights.startAppInsights();
    appInsights.logCustomEvent("initialize", "starting function execution after appInsights initialization!");

    //
    // Main Execution Logic
    //
    var creds = getCreds();
    var costCalculator = new BillingCostCalculator(creds.clientId, creds.clientSecret, creds.tenantId, creds.subscriptionId, creds.offerId);

    appInsights.logCustomEvent("costcalccreated", "clientId=" + creds.clientId + ";subscriptionId=" + creds.subscriptionId + ";offerId=" + creds.offerId);

    var params = getParams(req);

    appInsights.logCustomEvent("calculatingwithparams", "filter=" + params.filter + ";startDate=" + params.startDate + ";endDate=" + params.endDate + ";details=" + params.detailed);

    costCalculator.getCost(context, params.filter, params.granularity, params.startDate, params.endDate, params.detailed)

        .then(res => {
            context.log("And returned from the cost calculator function...");

            appInsights.logCustomEvent("calculatedsuccessfully", "calculation succeeded!!");

            context.res = res;
        })
        .catch(error => {
            context.log("FAILED with return from cost calculator function!!");

            appInsights.logCustomError("calculationfailed", error);

            context.log("returning with HTTP status 400");

            context.res = {
                status: 400,
                body: "Unable to track billing data!! Transaction ID: " + trnId
            };
        });
    context.done();
};