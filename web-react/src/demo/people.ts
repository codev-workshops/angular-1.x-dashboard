export type Person = {
  name: string;
  email: string;
  phone: string;
};

export function generatePeople(random: () => number = Math.random): Person[] {
  const firstNames = ['James', 'Christopher', 'Ronald', 'Mary', 'Lisa', 'Michelle', 'John', 'Daniel', 'Anthony', 'Patricia', 'Nancy', 'Laura'];
  const lastNames = ['Smith', 'Anderson', 'Clark', 'Wright', 'Mitchell', 'Johnson', 'Thomas', 'Rodriguez', 'Lopez', 'Perez'];
  const people: Person[] = [];
  while (people.length < 10) {
    const firstIndex = Math.floor(random() * firstNames.length);
    const lastIndex = Math.floor(random() * lastNames.length);
    const lastName = lastNames[lastIndex];
    const phone = random().toString().slice(2, 12).match(/^(\d{3})(\d{3})(\d{4})/)?.slice(1).join('-');
    if (!phone) {
      throw new Error('Random source did not produce enough digits');
    }
    people.push({
      name: `${firstNames[firstIndex]} ${lastName}`,
      email: `${lastName.toLowerCase()}@company.com`,
      phone,
    });
    firstNames.splice(firstIndex, 1);
    lastNames.splice(lastIndex, 1);
  }
  return people;
}
