import { rest } from "msw";
import { mockRepositories, mockUsers } from "./githubData";

export const handlers = [
  rest.get("https://api/search/users", (req, res, context) => {
    return res(context.status(200), context.json(mockUsers));
  }),
  rest.get("https://api/search/repositories", (req, res, context) => {
    return res(context.status(200), context.json(mockRepositories));
  }),
];
