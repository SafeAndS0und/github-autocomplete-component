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
  width: 100%;
  min-height: 100vh;

  display: grid;
  align-items: center;
  justify-items: center;
  padding: 50px;
`;
