import { axios } from "@pipedream/platform";
import linkedinAds from "../../linkedin_ads.app.mjs";

export default {
  key: "linkedin_ads-new-event-registration-response",
  name: "New Event Registration Response",
  description: "Emit new event when a fresh response is received on the event registration form. User needs to configure the prop of the specific event. [See the documentation](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/events?view=li-lms-2024-01&tabs=http)",
  version: "0.0.{{ts}}",
  type: "source",
  dedupe: "unique",
  props: {
    linkedinAds,
    db: "$.service.db",
    eventId: {
      propDefinition: [
        linkedinAds,
        "eventId",
      ],
    },
    timer: {
      type: "$.interface.timer",
      default: {
        intervalSeconds: 60 * 15, // 15 minutes
      },
    },
  },
  methods: {
    generateEventId(event) {
      return event.id + "-" + event.timestamp;
    },
    _getEventRegistrationResponsesSince(since) {
      return this.linkedinAds._makeRequest({
        path: `/eventRegistrations?q=event&eventId=${this.eventId}`,
        params: {
          start: since,
        },
      });
    },
    _getSince() {
      return this.db.get("since") || 0;
    },
    _setSince(since) {
      this.db.set("since", since);
    },
  },
  hooks: {
    async deploy() {
      // Fetch the last 50 events to backfill
      let events = await this._getEventRegistrationResponsesSince(0);
      events = events.slice(0, 50);
      for (const event of events) {
        const eventId = this.generateEventId(event);
        this.$emit(event, {
          id: eventId,
          summary: `New Event Registration: ${event.id}`,
          ts: Date.parse(event.timestamp),
        });
      }
      // Update the since value to the most recent event's timestamp
      if (events.length > 0) {
        const latestEventTimestamp = Math.max(...events.map((event) => Date.parse(event.timestamp)));
        this._setSince(latestEventTimestamp);
      }
    },
  },
  async run() {
    // Retrieve the last event timestamp
    const since = this._getSince();
    let events = await this._getEventRegistrationResponsesSince(since);

    // Filter out events that are older than the last emitted event
    events = events.filter((event) => {
      return Date.parse(event.timestamp) > since;
    });

    for (const event of events) {
      const eventId = this.generateEventId(event);
      this.$emit(event, {
        id: eventId,
        summary: `New Event Registration: ${event.id}`,
        ts: Date.parse(event.timestamp),
      });
    }

    // Update the since value to the most recent event's timestamp
    if (events.length > 0) {
      const latestEventTimestamp = Math.max(...events.map((event) => Date.parse(event.timestamp)));
      this._setSince(latestEventTimestamp);
    }
  },
};
