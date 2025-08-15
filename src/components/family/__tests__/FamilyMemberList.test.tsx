import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FamilyMemberList } from "../FamilyMemberList";
import { FamilyMember } from "@/types";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockMembers: FamilyMember[] = [
  {
    id: "1",
    fullName: "John Doe",
    nickname: "Johnny",
    relationship: "Father",
    profilePhoto: undefined,
    dateOfBirth: new Date("1980-01-01"),
    contactInfo: {
      phone: "+1234567890",
      email: "john@example.com",
      address: "123 Main St",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    fullName: "Jane Doe",
    nickname: "Janie",
    relationship: "Mother",
    profilePhoto: undefined,
    dateOfBirth: new Date("1985-05-15"),
    contactInfo: {
      phone: "+1234567891",
      email: "jane@example.com",
      address: "123 Main St",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    fullName: "Bob Doe",
    nickname: "Bobby",
    relationship: "Son",
    profilePhoto: undefined,
    dateOfBirth: new Date("2010-03-20"),
    contactInfo: {
      phone: "",
      email: "",
      address: "123 Main St",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("FamilyMemberList", () => {
  const defaultProps = {
    members: mockMembers,
    onAdd: jest.fn(),
    onEdit: jest.fn(),
    onView: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders family members list", () => {
    render(<FamilyMemberList {...defaultProps} />);

    expect(screen.getByText("Family Members")).toBeInTheDocument();
    expect(screen.getByText("3 members")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Bob Doe")).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<FamilyMemberList {...defaultProps} onAdd={onAdd} />);

    const addButton = screen.getByText("Add Family Member");
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalled();
  });

  it("filters members by search query", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Doe")).not.toBeInTheDocument();
    expect(screen.getByText("1 shown")).toBeInTheDocument();
  });

  it("filters members by relationship", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const relationshipSelect = screen.getByDisplayValue("All");
    await user.selectOptions(relationshipSelect, "Father");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Doe")).not.toBeInTheDocument();
  });

  it("sorts members by name", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const sortSelect = screen.getByDisplayValue("Relationship");
    await user.selectOptions(sortSelect, "Name");

    // Check that members are sorted alphabetically
    const memberCards = screen.getAllByText(/Doe$/);
    expect(memberCards[0]).toHaveTextContent("Bob Doe");
    expect(memberCards[1]).toHaveTextContent("Jane Doe");
    expect(memberCards[2]).toHaveTextContent("John Doe");
  });

  it("switches between grid and list view", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const listViewButton = screen.getByText("List");
    await user.click(listViewButton);

    // In list view, members should still be visible but in a different layout
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Bob Doe")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<FamilyMemberList {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading family members...")).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    render(<FamilyMemberList {...defaultProps} members={[]} />);

    expect(screen.getByText("No family members yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first family member to get started")
    ).toBeInTheDocument();
  });

  it("shows no results state when search returns no matches", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, "NonExistentName");

    expect(
      screen.getByText("No matching family members found")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filters")
    ).toBeInTheDocument();
  });

  it("passes callbacks to family member cards", () => {
    const onEdit = jest.fn();
    const onView = jest.fn();
    const onDelete = jest.fn();

    render(
      <FamilyMemberList
        {...defaultProps}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
      />
    );

    // Click on the first member card
    const firstCard = screen.getAllByRole("button")[0];
    fireEvent.click(firstCard);

    expect(onView).toHaveBeenCalledWith(mockMembers[0]);
  });

  it("hides actions when showActions is false", () => {
    render(<FamilyMemberList {...defaultProps} showActions={false} />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("displays member count correctly", () => {
    render(<FamilyMemberList {...defaultProps} />);

    expect(screen.getByText("3 members")).toBeInTheDocument();
  });

  it("displays filtered count when search is active", async () => {
    const user = userEvent.setup();
    render(<FamilyMemberList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, "John");

    expect(screen.getByText("3 members (1 shown)")).toBeInTheDocument();
  });
});
