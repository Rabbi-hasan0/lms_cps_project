import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    const plugin = strapi.plugin('users-permissions');
    if (plugin && plugin.controllers && plugin.controllers.user) {
      plugin.controllers.user.me = async (ctx: any) => {
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized();
        }

        const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        });

        ctx.body = userWithRole;
      };
    }
  },

  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};