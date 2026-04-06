type AnimalCardProps = {
  animal: {
    _id: string;
    name: string;
    breed: string;
    hoursTrained: number;
    imageUrl?: string;
    ownerId?: { _id: string; name: string } | string;
  };
};

export default function AnimalCard({ animal }: AnimalCardProps) {
  const ownerName =
    typeof animal.ownerId === "object" && animal.ownerId !== null
      ? animal.ownerId.name
      : null;

  return (
    <div className="bg-white border rounded-lg shadow p-4">
      {animal.imageUrl ? (
        <img
          src={animal.imageUrl}
          alt={animal.name}
          className="w-full h-48 object-cover rounded mb-3"
        />
      ) : (
        <div className="w-full h-48 rounded mb-3 bg-gray-200 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <h3 className="text-lg font-semibold">{animal.name}</h3>
      <p className="text-gray-700">Breed: {animal.breed}</p>
      <p className="text-gray-700">Hours Trained: {animal.hoursTrained}</p>
      {ownerName && <p className="text-gray-700">Owner: {ownerName}</p>}
    </div>
  );
}