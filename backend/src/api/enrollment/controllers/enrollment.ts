import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    // ১. লগইন চেক
    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll.');
    }

    const { course } = ctx.request.body.data || {};
    if (!course) {
      return ctx.badRequest('Course ID is required.');
    }

    const userDocumentId = user.documentId || user.id;

    // ২. ডুপ্লিকেট এনরোলমেন্ট চেক (Strapi v5 Document Service)
    const existingEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        user: { documentId: userDocumentId },
        course: { documentId: course }
      }
    });

    if (existingEnrollments.length > 0) {
      return ctx.badRequest('You are already enrolled in this course.');
    }

    // ৩. ইউজারের আইডি স্বয়ংক্রিয়ভাবে বাইন্ড করা
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: userDocumentId,
      completed_lessons: ctx.request.body.data.completed_lessons || []
    };

    return await super.create(ctx);
  }
}));