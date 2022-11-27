import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GithubAutocomplete, searchUsersAndRepositories } from "./GithubAutocomplete";
import "cross-fetch/polyfill";
import server from "../../mocks/msw";
import { rest } from "msw";

describe("GithubAutocomplete.tsx", () => {
  it("renders properly", async () => {
    const { getByPlaceholderText } = render(<GithubAutocomplete />);
    expect(getByPlaceholderText("Repository or username...")).toBeInTheDocument();
  });
});

describe("searchUsersAndRepositories", () => {
  it("handles optimistic request", async () => {
    const response = await searchUsersAndRepositories([
      "https://api/search/users?per_page=5",
      "https://api/search/repositories?per_page=5",
    ])("test");

    expect(Array.isArray(response.results)).toBe(true);
    expect(response.error).toBe(undefined);
  });

  it("handles failing request", async () => {
    server.use(
      rest.get("https://api/search/users", (req, res, context) => {
        return res(context.status(400));
      })
    );

    const response = await searchUsersAndRepositories([
      "https://api/search/users?per_page=5",
      "https://api/search/repositories?per_page=5",
    ])("test");

    expect(response.results.length).toBe(0);
    expect(typeof response.error === "string").toBe(true);
  });
});
