import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { ChakraProvider, Container } from "@chakra-ui/react";
import Forum from "./pages/Forum";
import NewPost from "./pages/NewPost";
import ViewPost from "./pages/ViewPost";
import OrbitProvider from "./providers/Orbit";

import Layout from "./components/Layout";
import Web3Provider from "./providers/Web3";

const queryClient = new QueryClient();

function App() {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <OrbitProvider>
          <ChakraProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Forum />} />
                  <Route path="/new" element={<NewPost />} />
                  <Route path="/:postId" element={<ViewPost />} />
                  <Route path="/:postId/edit" element={<ViewPost />} />
                  <Route
                    path="/:postId/:commentId/:action"
                    element={<ViewPost />}
                  />
                </Routes>
              </Layout>
            </HashRouter>
          </ChakraProvider>
        </OrbitProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
}

export default App;
