import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Autocomplete } from "./Autocomplete";
import "cross-fetch/polyfill";

const parseGithubResults = (results: any) => {
  return results
    .flatMap((item) => item.items)
    .map((item) => ({
      type: item.login ? ("user" as const) : ("repository" as const),
      displayText: item.login || item.full_name,
      url: item.html_url,
      imageUrl: item.avatar_url || item.owner?.avatar_url,
    }))
    .sort((a, b) => a.displayText.localeCompare(b.displayText));
};

describe("Autocomplete.tsx", () => {
  it("renders properly", async () => {
    const { getByPlaceholderText } = render(
      <Autocomplete search={async () => ({ results: [] })} />
    );

    expect(getByPlaceholderText("Repository or username...")).toBeInTheDocument();
  });

  it("doesn't call search when user types less than 3 characters", async () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "T" } });
    expect(handleChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "Te" } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("calls search when user types at least 3 characters", async () => {
    const handleChange = jest.fn(async () => ({ results: [] }));
    const { getByPlaceholderText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "Tes" } });
    await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(1), { timeout: 500 });

    fireEvent.change(input, { target: { value: "Test" } });
    await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(2), { timeout: 500 });
  });

  it("fetches and displays results properly", async () => {
    const handleChange = jest.fn(async () => {
      const response = await fetch("https://api/search/users");
      const users = await response.json();
      return { results: parseGithubResults([users]) };
    });

    const { getByPlaceholderText, findByText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "Test" } });

    expect(await findByText("abc")).toBeInTheDocument();
    expect(await findByText("bca")).toBeInTheDocument();
  });

  it("displays proper message when results are empty", async () => {
    const handleChange = jest.fn(async () => {
      return { results: [] };
    });

    const { getByPlaceholderText, findByText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "Test" } });

    expect(await findByText("No results found 🙄")).toBeInTheDocument();
  });

  it("handles errors", async () => {
    const handleChange = jest.fn(async () => {
      return { results: [], error: "TEST" };
    });

    const { getByPlaceholderText, findByText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "Test" } });

    expect(await findByText("Something went wrong ⚠")).toBeInTheDocument();
    expect(await findByText("TEST")).toBeInTheDocument();
  });

  it("sorts items and allows to navigate with keyboard arrows", async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const handleChange = jest.fn(async () => {
      const response = await fetch("https://api/search/users");
      const users = await response.json();
      return { results: parseGithubResults([users]) };
    });

    const { getByPlaceholderText, findByText } = render(<Autocomplete search={handleChange} />);
    const input = getByPlaceholderText("Repository or username...");

    fireEvent.change(input, { target: { value: "Test" } });

    const firstItem = await findByText("abc");
    const secondItem = await findByText("bca");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(window.getComputedStyle(firstItem).backgroundColor).not.toBe("white");
    expect(window.getComputedStyle(secondItem).backgroundColor).toBe("white");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(window.getComputedStyle(firstItem).backgroundColor).toBe("white");
    expect(window.getComputedStyle(secondItem).backgroundColor).not.toBe("white");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(window.getComputedStyle(firstItem).backgroundColor).not.toBe("white");
    expect(window.getComputedStyle(secondItem).backgroundColor).toBe("white");
  });
});
