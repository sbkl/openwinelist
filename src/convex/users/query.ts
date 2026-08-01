import { publicQuery } from "../functions";

export const me = publicQuery({
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user) return null;
    return user;
  },
});
