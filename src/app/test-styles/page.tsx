export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tailwind CSS Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Colors & Typography
            </h2>
            <p className="text-gray-600 mb-2">This is gray-600 text</p>
            <p className="text-red-500 mb-2">This is red-500 text</p>
            <p className="text-green-500 mb-2">This is green-500 text</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              Spacing & Layout
            </h2>
            <div className="space-y-2">
              <div className="bg-blue-200 p-2 rounded">Item 1</div>
              <div className="bg-blue-300 p-2 rounded">Item 2</div>
              <div className="bg-blue-400 p-2 rounded text-white">Item 3</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-6 rounded-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Gradients & Effects</h2>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
              Hover me
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Responsive Design Test</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-indigo-100 p-4 rounded text-center">
                <div className="text-indigo-600 font-semibold">
                  Item {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
