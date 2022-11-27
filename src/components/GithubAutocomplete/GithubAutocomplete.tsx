import React from "react";
import { Autocomplete, AutocompleteResultItem } from "./Autocomplete/Autocomplete";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

const parseGithubResponse = (githubResponse: unknown): AutocompleteResultItem[] => {
  if (!githubResponse || !Array.isArray(githubResponse)) {
    throw new Error("Response in wrong format");
  }

  return githubResponse
    .flatMap((item) => item.items)
    .map((item) => ({
      displayText: item.login || item.full_name,
      url: item.html_url,
      imageUrl: item.avatar_url || item.owner?.avatar_url,
    }))
    .sort((a, b) => a.displayText.localeCompare(b.displayText));
};

const prepareUrls = (urls: string[], query: string) => {
  return urls.map((initialUrl) => {
    const url = new URL(initialUrl);
    url.searchParams.set("q", query);
    return fetch(url).then((res) => res.json());
  });
};

export const searchUsersAndRepositories = (urls: string[]) => async (query: string) => {
  try {
    const results = await Promise.all(prepareUrls(urls, query));
    return { results: parseGithubResponse(results) };
  } catch (error) {
    return { error: getErrorMessage(error), results: [] };
  }
};

const githubEndpoints = [
  "https://api.github.com/search/users?per_page=50&page=1",
  "https://api.github.com/search/repositories?per_page=50&page=1",
];

// This is a concrete implementation of the Autocomplete component that fetches Github users/repos specifically
// This makes Autocomplete component more reusable with any type of searching functionality
// All we have to do is provide an async search function that returns a list of items in a specified format
export const GithubAutocomplete = () => {
  return <Autocomplete search={searchUsersAndRepositories(githubEndpoints)} />;
};
