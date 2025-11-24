import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as SupportMessagesDao from './support-messages.dao';

/**
 * Retrieves all support messages from the database.
 * 
 * @route GET /support-messages
 * @access Private
 * @returns {Promise<void>} JSON array of all support messages
 */
export const readSupportMessages: RequestHandler = async (_req: Request, res: Response) => {
    try {
        const messages = await SupportMessagesDao.readSupportMessages();
        res.status(200).json(messages);
    } catch (error) {
        console.error('[supportMessages.controller][readSupportMessages][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching support messages'
        });
    }
};

/**
 * Retrieves a specific support message by ID.
 * 
 * @route GET /support-messages/:messageId
 * @access Private
 * @param {number} req.params.messageId - The ID of the support message to retrieve
 * @returns {Promise<void>} JSON object containing support message data
 */
export const readSupportMessageById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const messageId = parseInt(req.params.messageId, 10);

        if (Number.isNaN(messageId)) {
            res.status(400).json({ message: 'Invalid message ID' });
            return;
        }

        const message = await SupportMessagesDao.readSupportMessageById(messageId);

        if (!message) {
            res.status(404).json({ message: 'Support message not found' });
            return;
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('[supportMessages.controller][readSupportMessageById][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the support message'
        });
    }
};

/**
 * Creates a new support message.
 * 
 * @route POST /support-messages
 * @access Private
 * @param {Object} req.body - Support message data
 * @returns {Promise<void>} JSON object with creation result
 */
export const createSupportMessage: RequestHandler = async (req: Request, res: Response) => {
    try {
        const okPacket: OkPacket = await SupportMessagesDao.createSupportMessage(req.body);
        res.status(201).json(okPacket);
    } catch (error) {
        console.error('[supportMessages.controller][createSupportMessage][Error] ', error);
        res.status(500).json({
            message: 'There was an error creating the support message'
        });
    }
};

/**
 * Updates an existing support message.
 * Public endpoint - allows users to update their own messages.
 * 
 * @route PUT /support-messages/:messageId
 * @access Public
 * @param {number} req.params.messageId - The ID of the support message to update
 * @param {Object} req.body - Updated support message data
 * @returns {Promise<void>} JSON object with update result
 */
export const updateSupportMessage: RequestHandler = async (req: Request, res: Response) => {
    try {
        const messageId = parseInt(req.params.messageId, 10);

        if (Number.isNaN(messageId)) {
            res.status(400).json({ message: 'Invalid message ID' });
            return;
        }

        const okPacket: OkPacket = await SupportMessagesDao.updateSupportMessage({
            ...req.body,
            messageId
        });

        if (okPacket.affectedRows === 0) {
            res.status(404).json({ message: 'Support message not found' });
            return;
        }

        res.status(200).json(okPacket);
    } catch (error) {
        console.error('[supportMessages.controller][updateSupportMessage][Error] ', error);
        res.status(500).json({
            message: 'There was an error updating the support message'
        });
    }
};

/**
 * Deletes a support message from the database.
 * 
 * @route DELETE /support-messages/:messageId
 * @access Private
 * @param {number} req.params.messageId - The ID of the support message to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteSupportMessage: RequestHandler = async (req: Request, res: Response) => {
    try {
        const messageId = parseInt(req.params.messageId, 10);

        if (Number.isNaN(messageId)) {
            res.status(400).json({ message: 'Invalid message ID' });
            return;
        }

        const okPacket: OkPacket = await SupportMessagesDao.deleteSupportMessage(messageId);

        if (okPacket.affectedRows === 0) {
            res.status(404).json({ message: 'Support message not found' });
            return;
        }

        res.status(200).json(okPacket);
    } catch (error) {
        console.error('[supportMessages.controller][deleteSupportMessage][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the support message'
        });
    }
};

