// components/AdminLink.js

export default function AdminLink() {
    return (
      <div className="flex justify-center mt-4">
        <a
          href="/admin"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Admin Panel
        </a>
      </div>
    );
  }
  