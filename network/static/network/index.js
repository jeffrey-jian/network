document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#following')) {
        const following = document.querySelector('#following');
        following.addEventListener('click', () => load_posts('following', 1));
    };
    
    //By default, load all posts
    console.log('loading all posts...')
    load_posts('all', 1);
});

function get_userinfo() {

    // GET request to /userinfo
    fetch('/get_userinfo')
    .then(response => response.json())
    .then(userinfo => {
        // Print user info
        console.log('Printing user info...');
        console.log(userinfo);
    });

    return false;
};

function paginate(type, array) {

    pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const total_pages = Math.ceil((array.length) / 10);
    var i;
    for (i = 1; i < total_pages + 1; i++) {
        
        const page = document.createElement('li');
        page.className = 'page-item';
        page.innerHTML = `<a class="page-link" id="page${i}" href="#">${i}</a>`;

        page.addEventListener('click', () => {
            load_posts(type, i);
        });

        pagination.append(page);
    };
};

function load_posts(type, page) {

    posts_div = document.querySelector('#posts');
    posts_div.innerHTML = '';

    // GET request to /posts/<type>
    fetch(`/get_posts/${type}`)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(`Printing posts with type:'${type}'...`);
        console.log(posts);
        console.log('End printing posts...')

        var i;
        let x = page * 10;
        if (page * 10 > posts.length) {
            x = posts.length;
        };

        for (i = page - 1; i < x; i++) {

            console.log(posts[i].poster);
            
            const card = document.createElement('div');
            card.className = 'card w-75';
            card.innerHTML = '';
            
            const card_body = document.createElement('div');
            card_body.className = 'card-body';
            card_body.innerHTML = '';
            

            const poster = document.createElement('h5');
            poster.className = 'card-title';
            poster.innerHTML = posts[i].poster;

            const body = document.createElement('p');
            body.className = 'card-text';
            body.innerHTML = posts[i].body;

            const timestamp = document.createElement('p');
            timestamp.className = 'card-text';
            timestamp.innerHTML = `<small class="text-muted">${posts[i].timestamp}</small>`;

            card_body.append(poster);
            card_body.append(body);
            card_body.append(timestamp);

            card.append(card_body);
            posts_div.append(card);

        };

        // Run pagination function
        paginate(type, posts);
        
    });

    return false;
};