type TrainingLogCardProps = {
  log: {
    _id: string;
    title: string;
    description: string;
    hours: number;
    date: string;
    userId: { _id: string; name: string } | string;
    animalId:
      | {
          _id: string;
          name: string;
          breed?: string;
        }
      | string;
  };
};

export default function TrainingLogCard({ log }: TrainingLogCardProps) {
  const trainerName =
    typeof log.userId === "object" && log.userId !== null ? log.userId.name : "";
  const animalName =
    typeof log.animalId === "object" && log.animalId !== null ? log.animalId.name : "";
  const animalBreed =
    typeof log.animalId === "object" && log.animalId !== null
      ? log.animalId.breed || ""
      : "";

  return (
    <div className="bg-white border rounded-lg shadow p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{log.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(log.date).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm font-medium">{log.hours} hr</p>
      </div>

      <p className="mt-3 text-gray-800">{log.description}</p>

      <div className="mt-3 text-sm text-gray-700">
        <p>User: {trainerName}</p>
        <p>
          Animal: {animalName}
          {animalBreed ? ` (${animalBreed})` : ""}
        </p>
      </div>
    </div>
  );
}