import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import App from "../App";

function renderApp(initialPath = "/"): void {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("renders the main navigation", () => {
    renderApp("/");
    expect(screen.getAllByText(/Painel Macro Brasil/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("navigation", { name: /primária/i }).length).toBeGreaterThan(0);
  });

  it("switches content when navigating by path", () => {
    renderApp("/metodologia");
    expect(screen.getByRole("heading", { name: /Metodologia/i })).toBeInTheDocument();
  });

  it("renders the models leaderboard heading", () => {
    renderApp("/modelos");
    expect(screen.getByRole("heading", { name: /Modelos/i })).toBeInTheDocument();
  });
});
