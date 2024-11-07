"use client";

import styled from "styled-components";

const Main = styled.main`
  background-color: black;
  color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

export default function Home() {

  console.log('fuck!')
  return (
      <Main>
        Root Page
      </Main>
  );
}
