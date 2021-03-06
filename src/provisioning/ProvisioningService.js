const WebhookStore = require("../storage/WebhookStore");
const Promise = require("bluebird");
const LogService = require("matrix-js-snippets").LogService;

class ProvisioningService {

    constructor() {
        this.PERMISSION_ERROR_MESSAGE = "User does not have permission to manage webhooks in this room";
    }

    /**
     * Sets the intent object to use for permission checking
     * @param {Intent} intent the intent to use
     */
    setClient(intent) {
        LogService.verbose("ProvisioningService", "Received intent. Using account " + intent.getClient().credentials.userId);
        this._intent = intent;
    }

    /**
     * Creates a new webhook for a room
     * @param {string} roomId the room ID the webhook belongs to
     * @param {string} userId the user trying to create the webhook
     * @returns {Promise<Webhook>} resolves to the created webhook
     */
    createWebhook(roomId, userId) {
        LogService.info("ProvisioningService", "Processing create hook request for " + roomId + " by " + userId);
        return this.hasPermission(userId, roomId)
            .then(() => WebhookStore.createWebhook(roomId, userId), () => Promise.reject(this.PERMISSION_ERROR_MESSAGE));
    }

    /**
     * Gets a list of all webhooks in a room
     * @param {string} roomId the room ID to search in
     * @param {string} userId the user trying to view the room's webhooks
     * @returns {Promise<Webhook[]>} resolves to the list of webhooks
     */
    getWebhooks(roomId, userId) {
        LogService.info("ProvisioningService", "Processing list hooks request for " + roomId + " by " + userId);
        return this.hasPermission(userId, roomId)
            .then(() => WebhookStore.listWebhooks(roomId), () => Promise.reject(this.PERMISSION_ERROR_MESSAGE));
    }

    /**
     * Gets a list of all webhooks in a room
     * @param {string} roomId the room ID to search in
     * @param {string} userId the user trying to view the room's webhooks
     * @param {string} hookId the webhook ID
     * @returns {Promise<*>} resolves when deleted
     */
    deleteWebhook(roomId, userId, hookId) {
        LogService.info("ProvisioningService", "Processing delete hook (" + hookId + ") request for " + roomId + " by " + userId);
        return this.hasPermission(userId, roomId)
            .then(() => WebhookStore.deleteWebhook(roomId, hookId), () => Promise.reject(this.PERMISSION_ERROR_MESSAGE));
    }

    /**
     * Checks to see if a user has permission to manage webhooks in a given room
     * @param {string} userId the user trying to manage webhooks
     * @param {string} roomId the room they are trying to manage webhooks in
     * @returns {Promise<*>} resolves if the user has permission, rejected otherwise
     */
    hasPermission(userId, roomId) {
        LogService.verbose("ProvisioningService", "Checking permission for " + userId + " in " + roomId);
        if (!this._intent) {
            LogService.warn("ProvisioningService", "Unable to check permission for " + userId + " in " + roomId + " because there is no Intent assigned to this service");
            return Promise.reject();
        }
        return this._intent.getClient().getStateEvent(roomId, "m.room.power_levels", "").then(powerLevels => {
            if (!powerLevels) {
                LogService.warn("ProvisioningService", "Unable to check permission for " + userId + " in " + roomId + " because there is no powerlevel information in the room");
                return Promise.reject();
            }

            const userPowerLevels = powerLevels['users'] || {};

            let powerLevel = userPowerLevels[userId];
            if (!powerLevel) powerLevel = powerLevels['users_default'];
            if (!powerLevel) powerLevel = 0; // default

            let statePowerLevel = powerLevels["state_default"];
            if (!statePowerLevel) {
                LogService.warn("ProvisioningService", "Unable to check permission for " + userId + " in " + roomId + " because the powerlevel requirement is missing for state_default");
                return Promise.reject();
            }

            const hasPermission = statePowerLevel <= powerLevel;

            LogService.verbose("ProvisioningService", "User " + userId + " in room " + roomId + " has permission? " + hasPermission + " (required powerlevel = " + statePowerLevel + ", user powerlevel = " + powerLevel + ")");

            return hasPermission ? Promise.resolve() : Promise.reject();
        });
    }
}

module.exports = new ProvisioningService();