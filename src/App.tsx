import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Forum from "./pages/Forum";
import NewPost from "./pages/NewPost";
import ViewPost from "./pages/ViewPost";
import UserProfile from "./pages/UserProfile";

import Layout from "./components/Layout";

import OrbitProvider from "./providers/Orbit";
import CeramicProvider from "./providers/Ceramic";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

function App() {
  return (
    <CeramicProvider>
      <QueryClientProvider client={queryClient}>
        <OrbitProvider>
          <ChakraProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Forum />} />
                  <Route path="/new" element={<NewPost />} />
                  <Route path="/:postId" element={<ViewPost />} />
                  <Route path="/u/:did" element={<UserProfile />} />
                </Routes>
              </Layout>
            </HashRouter>
          </ChakraProvider>
        </OrbitProvider>
      </QueryClientProvider>
    </CeramicProvider>
  );
}

export default App;
