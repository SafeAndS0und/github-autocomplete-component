import React from "react";
import { GithubAutocomplete } from "../components/GithubAutocomplete/GithubAutocomplete";
import styled from "styled-components";

export default () => {
  return (
    <Home>
      <GithubAutocomplete />
    </Home>
  );
};

const Home = styled.div`
  display: grid;
  align-items: start;
  justify-items: center;
  margin-top: 80px;
  padding: 20px;
`;
