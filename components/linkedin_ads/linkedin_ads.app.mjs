import { axios } from "@pipedream/platform";
import app from "../linkedin/linkedin.app.mjs";

export default {
  ...app,
  type: "app",
  app: "linkedin_ads",
  propDefinitions: {
    ...app.propDefinitions,
    leadGenFormId: {
      type: "string",
      label: "Lead Gen Form Id",
      description: "The ID of the Lead Gen Form to retrieve responses for.",
      async options({ page }) {
        const limit = 20;
        const { elements } = await this.searchLeadGenForms({
          params: {
            count: limit,
            start: page * limit,
          },
        });
        return elements?.map(({
          id, name,
        }) => ({
          label: name,
          value: id,
        }));
      },
    },
    eventId: {
      type: "string",
      label: "Event ID",
      description: "The ID of the event to retrieve registrations for.",
      async options({ page }) {
        const limit = 20;
        const { elements } = await this.searchEvents({
          params: {
            count: limit,
            start: page * limit,
          },
        });
        return elements?.map(({
          id, name,
        }) => ({
          label: name,
          value: id,
        }));
      },
    },
    audienceName: {
      type: "string",
      label: "Audience Name",
      description: "The name of the audience for targeting.",
    },
    audienceId: {
      type: "string",
      label: "Audience ID",
      description: "The ID of the existing audience to add a contact to.",
      async options({ page }) {
        const limit = 20;
        const { elements } = await this.searchAudiences({
          params: {
            count: limit,
            start: page * limit,
          },
        });
        return elements?.map(({
          id, name,
        }) => ({
          label: name,
          value: id,
        }));
      },
    },
    contactId: {
      type: "string",
      label: "Contact ID",
      description: "The ID of the contact to add to the audience.",
    },
    conversionId: {
      type: "string",
      label: "Conversion ID",
      description: "The ID of the conversion event.",
    },
    conversionValue: {
      type: "number",
      label: "Conversion Value",
      description: "The value of the conversion event.",
      optional: true,
    },
    associatedContactId: {
      type: "string",
      label: "Associated Contact ID",
      description: "The ID of the associated contact for the conversion event.",
      optional: true,
    },
    timestamp: {
      type: "string",
      label: "Timestamp",
      description: "The timestamp when the conversion event occurred in ISO 8601 format.",
      optional: true,
    },
  },
  methods: {
    ...app.methods,
    _baseUrl() {
      return "https://api.linkedin.com";
    },
    async _makeRequest(opts = {}) {
      const {
        $ = this,
        method = "GET",
        path,
        headers,
        ...otherOpts
      } = opts;
      return axios($, {
        ...otherOpts,
        method,
        url: this._baseUrl() + path,
        headers: {
          ...headers,
          "Authorization": `Bearer ${this.$auth.oauth_access_token}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": `0.0.${new Date().getTime()}`,
        },
      });
    },
    async searchLeadGenForms({ params }) {
      return this._makeRequest({
        path: "/leadForms",
        params,
      });
    },
    async searchEvents({ params }) {
      return this._makeRequest({
        path: "/events",
        params,
      });
    },
    async searchAudiences({ params }) {
      return this._makeRequest({
        path: "/audiences",
        params,
      });
    },
    async createAudience({ audienceName }) {
      return this._makeRequest({
        method: "POST",
        path: "/v2/dmpSegments",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          name: audienceName,
          sourcePlatform: "DMP_PARTNER_PLATFORM",
          account: this.$auth.account_id,
          accessPolicy: "PRIVATE",
          type: "USER",
          destinations: [
            {
              destination: "LINKEDIN",
            },
          ],
        },
      });
    },
    async addToAudience({
      audienceId, contactId,
    }) {
      return this._makeRequest({
        method: "POST",
        path: `/v2/dmpSegments/${audienceId}/users`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          user: contactId,
        },
      });
    },
    async sendConversionEvent({
      conversionId, conversionValue, associatedContactId, timestamp,
    }) {
      return this._makeRequest({
        method: "POST",
        path: "/rest/conversionEvents",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          conversionId,
          conversionValue,
          associatedContactId,
          timestamp,
        },
      });
    },
  },
};
