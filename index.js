const API = 'https://64da83dee947d30a260b5a1a.mockapi.io/api/v1';

const METHODS = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
}

let HEROES = [];

async function controller(action, method = 'GET', body) {
	const params = {
		method: method,
		headers: {
			'content-type':'application/json',
		},
	};

	if (body) params.body = JSON.stringify(body);

	try {
		const response = await fetch(action, params);
		const data = await response.json();

		return data;
	} catch (err) {
		console.log(err);
	}
}

async function getUniverses() {
	const universes = await controller(`${API}/universes`);
	const universesArray = universes.map(universe => universe.name);
	return universesArray;
}

async function getHeroes() {
	const heroes = await controller(`${API}/heroes`);
	return heroes;
}

async function fetchData() {
	const heroes = await getHeroes();

	HEROES = heroes;

	const isHeroesForm = document.querySelector('#heroesForm');

	if (!isHeroesForm) {
		const universes = await getUniverses();
		renderAddForm(universes);
	};
	
	renderTable(heroes);
}

function renderAddForm(universes) {
	const body = document.querySelector('body');

	const heroesForm = document.createElement('form');
	const nameLabel = document.createElement('label');
	const nameInput = document.createElement('input');
	const comicsLabel = createASelectionOfUniverses(universes);
	const favouriteLabel = document.createElement('label');
	const favouriteDiv = document.createElement('div');
	const favouriteCheckbox = document.createElement('input');
	const addButton = document.createElement('button');

	heroesForm.className = 'heroes__form';
	heroesForm.id = 'heroesForm';

	nameInput.type = 'text';
	nameInput.placeholder = 'Enter a superhero name';
	nameInput.name = 'heroName';
	nameLabel.innerText = 'Name Surname: ';

	favouriteDiv.className = 'heroFavouriteInput';
	favouriteCheckbox.type = 'checkbox';
	favouriteCheckbox.name = 'heroFavourite';
	favouriteLabel.innerText = 'Favourite: ';
	
	addButton.type = 'submit';
	addButton.innerText = 'Add Hero';

	heroesForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		
		const name = nameInput.value;

		const nameIsValid = !HEROES.find(hero => hero.name === name);

		if (nameIsValid && name) {
			const comicsValue = document.querySelector('select[name=heroComics]').value;
			const favourite = favouriteCheckbox.checked;

			nameInput.value = '';
			favouriteCheckbox.checked = false;
			
			const body = {
				name: name,
				comics: comicsValue,
				favourite: favourite,
			}
			
			await controller(`${API}/heroes`, METHODS.POST, body);
	
			fetchData();
		} else {
			console.log('User with that name already exists in the database');
		}
	})
	
	nameLabel.append(nameInput);
	heroesForm.append(nameLabel);

	heroesForm.append(comicsLabel);

	favouriteDiv.append(favouriteCheckbox);
	favouriteLabel.append(favouriteDiv);
	heroesForm.append(favouriteLabel);

	heroesForm.append(addButton);

	body.append(heroesForm);
}

function renderTable(heroes) {
	const body = document.querySelector('body');
	const theTableWasRendered = document.querySelector('#heroesTable');

	if (theTableWasRendered) {
		theTableWasRendered.remove();
	}

	const heroesTable = document.createElement('table');
	const tableHead = document.createElement('thead');
	const headRow = document.createElement('tr');
	const tableBody = document.createElement('tbody');

	const headCells = ['Name Surname', 'Comics', 'Favourite', 'Actions'];

	heroesTable.className = 'heroes__table';
	heroesTable.id = 'heroesTable';

	headCells.forEach(cellText => {
		const headCell = document.createElement('th');
		headCell.innerText = cellText;
		headRow.append(headCell);
	});

	tableHead.append(headRow);
	heroesTable.append(tableHead);

	createTableTrs(heroes);

	heroesTable.append(tableBody);

	body.append(heroesTable);

	function createTableTrs(heroes) {
		tableBody.innerText = '';
		heroes.forEach(hero => { tableBody.append(createTableTr(hero)) });
	}

	function createTableTr(hero) {
		const tr = document.createElement('tr');
		const favouriteLabel = document.createElement('label');
		const favouriteCheckbox = document.createElement('input');
		const favouriteTd = document.createElement('td');
		const deleteButtonTd = document.createElement('td');
		const deleteButton = document.createElement('button');

		const bodyCellNames = [hero.name, hero.comics];
		bodyCellNames.forEach(cellText => {
			const td = document.createElement('td');
			td.innerText = cellText;
			tr.append(td);
		});

		favouriteLabel.className = 'heroFavouriteInput';
		favouriteLabel.innerText = 'Favourite: ';
		favouriteCheckbox.type = 'checkbox';
		favouriteCheckbox.checked = hero.favourite;

		favouriteCheckbox.addEventListener('change', async (e) => {
			const body = {
				name: hero.name,
				comics: hero.comics,
				favourite: favouriteCheckbox.checked,
			}
			
			await controller(`${API}/heroes/${hero.id}`, METHODS.PUT, body);
		})

		favouriteLabel.append(favouriteCheckbox);
		favouriteTd.append(favouriteLabel);
		tr.append(favouriteTd);

		deleteButton.innerText = 'Delete';

		deleteButton.addEventListener('click', async (e) => {
			await controller(`${API}/heroes/${hero.id}`, METHODS.DELETE);
			const deletedHero = HEROES.findIndex(superHero => superHero.id === hero.id);
			HEROES = [...HEROES.slice(0, deletedHero), ...HEROES.slice(deletedHero + 1)];
			createTableTrs(HEROES);
		})

		deleteButtonTd.append(deleteButton);
		tr.append(deleteButtonTd);

		return tr;
	}
}

function createASelectionOfUniverses(universes) {
	const comicsLabel = document.createElement('label');
	const comicsSelect = document.createElement('select');

	comicsSelect.name = 'heroComics';

	universes.forEach(universe => {
		const option = document.createElement('option');
		option.value = universe;
		option.innerText = universe;
		comicsSelect.append(option);
	})

	comicsLabel.innerText = 'Comics: ';

	comicsLabel.append(comicsSelect);
	return comicsLabel;
}

fetchData();