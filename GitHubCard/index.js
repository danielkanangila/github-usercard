/* Step 1: using axios, send a GET request to the following URL 
           (replacing the palceholder with your Github name):
           https://api.github.com/users/<your name>
*/

/* Step 2: Inspect and study the data coming back, this is YOUR 
   github info! You will need to understand the structure of this 
   data in order to use it to build your component function 

   Skip to Step 3.
*/

/* Step 4: Pass the data received from Github into your function, 
           create a new component and add it to the DOM as a child of .cards
*/

/* Step 5: Now that you have your own card getting added to the DOM, either 
          follow this link in your browser https://api.github.com/users/<Your github name>/followers 
          , manually find some other users' github handles, or use the list found 
          at the bottom of the page. Get at least 5 different Github usernames and add them as
          Individual strings to the friendsArray below.
          
          Using that array, iterate over it, requesting data for each user, creating a new card for each
          user, and adding that card to the DOM.
*/

const followersArray = [];

/* Step 3: Create a function that accepts a single object as its only argument,
          Using DOM methods and properties, create a component that will return the following DOM element:

<div class="card">
  <img src={image url of user} />
  <div class="card-info">
    <h3 class="name">{users name}</h3>
    <p class="username">{users user name}</p>
    <p>Location: {users location}</p>
    <p>Profile:  
      <a href={address to users github page}>{address to users github page}</a>
    </p>
    <p>Followers: {users followers count}</p>
    <p>Following: {users following count}</p>
    <p>Bio: {users bio}</p>
  </div>
</div>

*/

/* List of LS Instructors Github username's: 
  tetondan
  dustinmyers
  justsml
  luishrd
  bigknell
*/
const html = String.raw;
const base_url = 'https://api.github.com/users/danielkanangila';
const domParser = new DOMParser();

/**
 * Fetch data from given url
 * @param url api url
 * @returns axios response
 * 
 */
async function fetchData(url) {
  try {
    return await axios.get(url)
  } catch (error) {
    console.error(error);
  }
}

/**
 * Create github card element
 * 
 * @param {
 * login, 
 * avatar_url, 
 * name,
 * location,
 * html_url
 * followers,
 * following,
 * bio } 
 * @returns gitHubCard html component 
 */
function GitHubCard({login, avatar_url, name, location, html_url, followers, following, bio}) {
  const template = html`
    <div class="card">
      <img src=${avatar_url} />
      <div class="card-info">
        <h3 class="name">${name || login}</h3>
        <p class="username">${login}</p>
        <p>Location: ${location}</p>
        <p>Profile:  
          <a href="${html_url}">${html_url}</a>
        </p>
        <p>Followers: ${followers}</p>
        <p>Following: ${following}</p>
        <p>Bio: ${bio}</p>
      </div>
    </div>
  `
  return domParser.parseFromString(template, 'text/html').body.firstChild;
}

/**
 * Find  own followers if less than 5 find follower's followers
 * @param followers_url followers url from api
 * @returns list of followers
 * 
 */
async function findFriends(followers_url) {
  const followers = await fetchData(followers_url);
  const friendsUrl = followers.data.map(data => data.url);

  const friends = []

  for(let i=0; i < friendsUrl.length; i++) {
    const friend = await fetchData(friendsUrl[i]);
    friends.push(friend.data)
  }

  // add follower's followers if own followers are less than 5
  if (friends.length < 5) {
    let followersBisUrls = []
    for (let a=0; a < friends.length; a++) {
      if (friends[a].followers > 0) {
        let url = await fetchData(friends[a].followers_url)
        url = url.data.map(f => f.url);
        url = url.filter(u => u !== base_url);
        followersBisUrls.push(url);
      }
    }

    followersBisUrls = [].concat.apply([], followersBisUrls);
    
    for(let i=0; i < followersBisUrls.length; i++) {
      const friend = await fetchData(followersBisUrls[i]);
      friends.push(friend.data)
    }
    
  }
  
  return friends;
}

function TitleH2(title) {
  return domParser.parseFromString(`<h2 class="title">${title}</h2>`, 'text/html')
    .body.firstChild;
}

/**
 * Add created card to the dom
 */
async function addCardsToDOM() {
  const user = await fetchData(base_url);
  const friends = await findFriends(user.data.followers_url);

  const userCard = GitHubCard({...user.data});

  const followerCards = [];

  friends.forEach((data, index) => {
    followerCards.push(GitHubCard({...data}));
  });


  const cards = document.querySelector('.cards');
  cards.appendChild(userCard);
  cards.appendChild(TitleH2('Followers'));

  followerCards.forEach((el, index) => {
    cards.appendChild(el)
    if (index == 2)
      cards.appendChild(TitleH2('Your followers are follow by:'));
  });
}


addCardsToDOM()
new GitHubCalendar(".graph-container", "danielkanangila");
