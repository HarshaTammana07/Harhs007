import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../Card";

describe("Card Components", () => {
  it("renders Card with all sub-components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
        <CardFooter>
          <button>Test Footer</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /test footer/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(
      <Card className="custom-class" data-testid="card">
        <CardContent>Content</CardContent>
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("custom-class");
    expect(card).toHaveClass("rounded-lg", "border", "border-gray-200");
  });

  it("renders CardTitle with proper heading tag", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
        </CardHeader>
      </Card>,
    );

    const title = screen.getByRole("heading", { name: /my title/i });
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H3");
  });
});
