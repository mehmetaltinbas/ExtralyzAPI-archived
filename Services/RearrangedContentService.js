import { models } from '../Data/Sequelize.js';
import userService from './UserService.js';
import documentService from './DocumentService.js';
import { errorHandler } from '../Utilities/ErrorHandler.js';

const CreateAsync = errorHandler(
    async function RearrangedContentService_CreateAsync(authorization, data) {
        const document = await documentService.GetByIdAsync(data.documentId, authorization);

        const rearrangedContents = await GetAllAsync(authorization, data.documentId);
        console.log(
            `\nRearranged contents --> ${JSON.stringify(rearrangedContents, null, 2)}\n`,
        );
        let version = 1;
        if (rearrangedContents.length > 0)
            version = rearrangedContents[rearrangedContents.length - 1].Version + 1;

        const rearrangedContent = await models.RearrangedContent.create({
            DocumentId: document.Id,
            Version: version,
            FormattedContent: data.text,
            FormattedType: data.type,
        });
        if (!rearrangedContent) return "Rearranged content couldn't created.";
        return 'Rearranged content created.';
    },
);

const GetAllAsync = errorHandler(
    async function RearrangedContentService_GetAllAsync(authorization, id) {
        const document = await documentService.GetByIdAsync(id, authorization);
        const rearrangedContents = await models.RearrangedContent.findAll({
            where: {
                DocumentId: document.Id,
            },
        });
        if (!rearrangedContents) return 'No rearranged content found.';
        return rearrangedContents;
    },
);

const GetByVersionAsync = errorHandler(
    async function RearrangedContentService_GetByVersionAsync(authorization, id, version) {
        const document = await documentService.GetByIdAsync(id, authorization);
        if (document.isSuccess == false || typeof document === 'string') return document;

        const rearrangedContent = await models.RearrangedContent.findOne({
            where: {
                DocumentId: id,
                Version: version,
            },
        });
        if (!rearrangedContent) return 'No rearranged content found.';

        if (!(document.Id == rearrangedContent.DocumentId))
            return "You don't have any rearranged content with that Id.";
        return rearrangedContent;
    },
);

const GetByIdAsync = errorHandler(
    async function RearrangedContentService_GetByIdAsync(authorization, id) {
        const rearrangedContent = await models.RearrangedContent.findByPk(id);

        const document = await documentService.GetByIdAsync(
            rearrangedContent.DocumentId,
            authorization,
        );
        if (document.success === false || typeof document == 'string') return document;

        return rearrangedContent;
    },
);

const UpdateAsync = errorHandler(async function RearrangedContentService_UpdateAsync() {});

const DeleteAsync = errorHandler(async function RearrangedContentService_DeleteAsync(id) {
    const rearrangedContent = await GetByIdAsync(id);
    if (typeof rearrangedContent == 'string') return rearrangedContent;
    const deletedCount = await models.RearrangedContent.destroy({
        where: {
            Id: id,
        },
    });
    if (deletedCount === 0) return 'No rearranged content found.';
    return 'Rearranged content deleted.';
});

export default {
    CreateAsync,
    GetAllAsync,
    GetByVersionAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
