import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { RiLoader4Line } from "react-icons/ri";
import { debounce } from "lodash";

export interface AutocompleteResultItem {
  displayText: string;
  imageUrl?: string;
  url?: string;
}

interface SearchReturnValue {
  results: AutocompleteResultItem[];
  error?: string;
}

interface AutocompleteProps {
  search: (query: string) => Promise<SearchReturnValue>;
}

// Autocomplete on its own only handles:
// - The logic of typing and when to initiate/cancel the search (using debounce)
// - Following and giving feedback about the progress (loading, error, no results)
// - Displaying and helping to navigate through result items
// It is not responsible for fetching and delivering the data, which makes it more reusable.
// It's the job of its parent to provide an async search function that should return either the result items or error message.
export const Autocomplete = (props: AutocompleteProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [resultItems, setResultItems] = useState<AutocompleteResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoResults, setIsNoResults] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      const searchResponse = await props.search(query);
      setIsLoading(false);

      if (searchResponse.error) {
        setError(searchResponse.error);
        return;
      }

      setError(undefined);
      setSelectedResultIndex(-1);

      if (searchResponse.results.length > 0) {
        setResultItems(searchResponse.results);
        setIsNoResults(false);
      } else {
        setIsNoResults(true);
        setResultItems([]);
      }
    }, 400),
    []
  );

  const onChange = (newSearchValue: string) => {
    setSearchValue(newSearchValue);

    if (newSearchValue.length >= 3) {
      setIsLoading(true);
      debouncedSearch(newSearchValue);
    } else {
      debouncedSearch.cancel();
      setIsLoading(false);
      setError(undefined);
      setResultItems([]);
    }
  };

  const onKeyDown = (key: string, preventDefault: () => any) => {
    if (resultItems.length === 0) {
      return;
    }

    switch (key) {
      case "ArrowDown": {
        preventDefault();
        setSelectedResultIndex((previousIndex) => {
          if (previousIndex !== resultItems.length - 1) {
            return previousIndex + 1;
          }
          return previousIndex;
        });
        break;
      }
      case "ArrowUp": {
        preventDefault();
        setSelectedResultIndex((previousIndex) => {
          if (previousIndex !== -1) {
            return previousIndex - 1;
          }
          return previousIndex;
        });
        break;
      }
      case "Enter": {
        const item = resultItems[selectedResultIndex];
        if (item?.url) {
          window.open(item.url, "_newtab");
        }
      }
    }
  };

  const showResultBox = resultItems.length > 0 || isNoResults || error;

  return (
    <AutocompleteContainer>
      <InputContainer>
        <input
          placeholder="Repository or username..."
          value={searchValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e.key, () => e.preventDefault())}
        />
        <Indicator>{isLoading && <RiLoader4Line size={18} />}</Indicator>
      </InputContainer>
      {showResultBox && (
        <ResultBox>
          {resultItems.map((result, i) => (
            <ResultItem
              result={result}
              active={selectedResultIndex === i}
              key={result.url + result.displayText}
            />
          ))}
          {isNoResults && <NoResults>No results found 🙄</NoResults>}
          {error && (
            <ErrorMessage>
              <h3>Something went wrong ⚠</h3>
              <p>{error}</p>
            </ErrorMessage>
          )}
        </ResultBox>
      )}
    </AutocompleteContainer>
  );
};

interface ResultItemProps {
  result: AutocompleteResultItem;
  active?: boolean;
}

const ResultItem = ({ result, active }: ResultItemProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active]);

  return (
    <ResultItemContainer active={active} href={result.url} target="_blank" ref={ref}>
      {result.imageUrl && <img src={result.imageUrl} alt="User avatar" />}
      {result.displayText}
    </ResultItemContainer>
  );
};

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const AutocompleteContainer = styled.div`
  width: 100%;
  max-width: 370px;
  display: grid;
  gap: 10px;
  align-items: end;
`;

const InputContainer = styled.div`
  width: 100%;
  outline: 1px solid #acacac;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 1fr auto;

  &:focus-within {
    outline: 2px solid #235aff;
  }

  input {
    padding: 18px;
    height: 100%;
    margin: 0;
    border: none;
    outline: none;
    font-size: 15px;
  }
`;

const Indicator = styled.div`
  display: grid;
  align-items: center;
  justify-items: center;
  padding: 15px;

  svg {
    animation: ${rotate} 2s linear infinite;
    color: grey;
  }
`;

const ResultBox = styled.div`
  width: 100%;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  max-height: 280px;
  overflow: auto;
`;

const ResultItemContainer = styled.a<{ active?: boolean }>`
  padding: 10px 15px;
  font-weight: 400;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  gap: 15px;
  align-items: center;
  text-decoration: none;
  color: black;
  background-color: ${(p) => (p.active ? "#f8f8f8" : "white")};

  &:hover {
    background-color: #f8f8f8;
  }

  img {
    width: 30px;
    height: 30px;
    border: 1px solid #eeeeee;
  }
`;

const NoResults = styled.p`
  text-align: center;
  font-size: 14px;
  color: #696969;
  font-weight: 400;
  padding: 20px 0;
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: #cd3535;
  font-weight: 400;
  padding: 20px;
  display: grid;
  gap: 12px;
  text-align: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  p {
    color: #696969;
    font-size: 14px;
    margin: 0;
  }
`;
