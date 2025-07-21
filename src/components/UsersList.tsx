import { useEffect, useState } from 'react';

type User = { id: number; name: string };

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users List</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
