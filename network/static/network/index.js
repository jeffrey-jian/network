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

    //GET request to /get_userinfo
    fetch('/get_userinfo')
    .then(response => response.json())
    .then(userinfo => {
        // Print user info
        console.log('Printing user info...');
        console.log(userinfo);

        // New Post
        // Listen for submission of new post form
        document.querySelector('#new_post').onsubmit = () => {

            // Obtain post body from input field
            const new_body = document.querySelector('#new_post_body').value;

            // Log post body into console
            console.log(`New Post: ${new_body}`);

            // POST to /new_post
            fetch('/new_post', {
                method: 'POST',
                body: JSON.stringify({
                    new_body: new_body
                })
            })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log(result);

                // Posted successfully
                if (!result.error) {
                    // TODO 
                }
            })
        };
        


        // Load Posts
        // GET request to /posts/<type>
        fetch(`/get_posts/${type}`)
        .then(response => response.json())
        .then(posts => {
            // Print posts
            console.log(`print posts with type ${type}:`);  

            heading = document.querySelector('#heading');
            if (type == 'all') {
                heading.innerHTML = 'All Posts';
            } else if (type == 'following') {
                heading.innerHTML = 'Following'
            };

            var i;
            let x = page * 10;
            if (page * 10 > posts.length) {
                x = posts.length;
            };

            for (i = page - 1; i < x; i++) {

                post_id = posts[i].id;

                const card = document.createElement('div');
                card.className = 'card w-75 mx-auto';
                card.id = `post${i}`;
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

                const likes_div = document.createElement('div');
                likes_div.className = 'likes_div';

                const like_counter = document.createElement('span');
                like_counter.className = 'like_counter align-top'
                like_counter.innerHTML = ` ${(posts[i].likes).length}`;

                const like_icon = document.createElement('span');
                like_icon.className = 'material-icons-outlined';
                like_icon.innerHTML = 'favorite';

                if (posts[i].likes.includes(userinfo.username)) {
                    
                    console.log(`POST${i} already LIKED.`)
                    like_counter.style = 'color: red';
                    like_icon.style = 'color: red';

                } else {

                    console.log(`POST${i} NOT LIKED.`)
                    like_counter.style = 'color: gray';
                    like_icon.style = 'color: lightgray';
                }

                like_icon.addEventListener('click', () => {
                    
                    console.log(`clicked like on ${post_id}`)
                    
                    // Run like post function
                    like_post(post_id, like_icon, like_counter)
                    
                });

                likes_div.append(like_icon);
                likes_div.append(like_counter);

                card_body.append(poster);
                card_body.append(body);
                card_body.append(timestamp);
                card_body.append(likes_div);

                card.append(card_body);
                posts_div.append(card);

            };

            // Run pagination function
            paginate(type, posts);
            
        });

    });

    return false;
};

function like_styling(post_id, like_counter, like_icon) {
    


    like_counter.style = 'color: gray';
    like_icon.style = 'color: lightgray';
};

function like_post(post_id, like_icon, like_counter) {

    var count = parseInt(like_counter.innerHTML);

    fetch(`/like_post/${post_id}`)
    .then(response => response.json())
    .then(result => {

        console.log(result.message);

        if (result.message == "Post liked.") {
            like_icon.style = 'color: red';
            count++;
            like_counter.innerHTML = (' ').concat(count);
            like_counter.style = 'color: red';
        }
        else {
            like_icon.style = 'color: lightgray';
            count--;
            like_counter.innerHTML = (' ').concat(count);
            like_counter.style = 'color: gray';
        };
    });
    return false;
};