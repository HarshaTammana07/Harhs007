import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock URL
const mockURL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
};

Object.defineProperty(window, "URL", {
  value: mockURL,
});

// Mock Blob
global.Blob = class MockBlob {
  constructor(
    public parts: any[],
    public options: any
  ) {}
} as any;

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  mockURL.createObjectURL.mockClear();
  mockURL.revokeObjectURL.mockClear();
});
