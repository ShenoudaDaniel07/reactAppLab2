import "./App.css";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

// Queries
const GET_USERS = gql`
  query {
    users {
      _id
      firstName
      age
      company {
        _id
        name
      }
    }
  }
`;

const GET_COMPANIES = gql`
  query {
    companies {
      _id
      name
    }
  }
`;

// Mutations
const CREATE_USER = gql`
  mutation CreateUser($firstName: String!, $age: Int!, $companyId: ID) {
    createUser(firstName: $firstName, age: $age, companyId: $companyId) {
      _id
      firstName
      age
      company {
        _id
        name
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $firstName: String, $age: Int) {
    updateUser(id: $id, firstName: $firstName, age: $age) {
      _id
      firstName
      age
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      _id
    }
  }
`;

function App() {
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const { data: companyData, loading: companyLoading } =
    useQuery(GET_COMPANIES);

  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");

  if (loading || companyLoading) return <p>Loading...</p>;
  if (error) return <p>Error! {error.message}</p>;

  const handleCreate = async () => {
    if (!firstName || !age) return alert("Name and Age are required");
    await createUser({
      variables: {
        firstName,
        age: parseInt(age),
        companyId: companyId || null,
      },
    });
    setFirstName("");
    setAge("");
    setCompanyId("");
    refetch();
  };

  const handleUpdate = async (id) => {
    await updateUser({
      variables: { id, firstName: editName, age: parseInt(editAge) },
    });
    setEditId(null);
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteUser({ variables: { id } });
    refetch();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Users</h2>
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user._id}>
              <td>
                {editId === user._id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  user.firstName
                )}
              </td>
              <td>
                {editId === user._id ? (
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                  />
                ) : (
                  user.age
                )}
              </td>
              <td>{user.company?.name || "No Company"}</td>
              <td>
                {editId === user._id ? (
                  <>
                    <button onClick={() => handleUpdate(user._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditId(user._id);
                        setEditName(user.firstName);
                        setEditAge(user.age);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Create User</h3>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          placeholder="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">No Company</option>
          {companyData.companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
}

export default App;
