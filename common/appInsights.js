const appInsights = require("applicationinsights");

module.exports = class AppInsightsHelper {

    constructor(eventBaseName, transactionId) {
        this.eventProto = {
            name: eventBaseName,
            properties: {
                trnId: transactionId,
                phase: "n/a",
                details: "n/a"
            }
        };
    }

    startAppInsights(context) {
        context.log("---- msz appinsights setup ----")
        context.log(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
        if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY === undefined) {
            throw "no appinsights instrumentation key set in environment variables!!";
        }
        appInsights.setup();
        appInsights.start();
        context.log("---- msz appinsights setup ----")
    }

    logCustomEvent(phase, details) {
        var client = appInsights.defaultClient;

        this.eventProto.properties.phase = phase;
        this.eventProto.properties.details = details;

        client.trackEvent(this.eventProto);
    }

    logCustomError(phase, error) {
        var client = appInsights.defaultClient;

        this.eventProto.properties.phase = phase;
        this.eventProto.properties.details = error;

        client.trackException({exception: new Error(JSON.stringify(this.eventProto))});
    }
}