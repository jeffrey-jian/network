document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#following')) {
        const following = document.querySelector('#following');
        following.addEventListener('click', () => load_posts('following', 1));
    };

    // Message
    const message = document.querySelector('#message');

    // Load all posts by default
    load_posts('all', 1);

});

async function get_userinfo() {
    
    try {
        const response = await fetch('/get_userinfo');
        const user = await response.json();
        return user;
    } catch (error) {
        console.error(error);
    };

};

function paginate(type, array) {

    pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const total_pages = Math.ceil((array.length) / 10);
    var i;
    for (i = 1; i < total_pages + 1; i++) {
        
        const page = document.createElement('li');
        page.id = `page${i}`;
        page.className = 'page-item';
        page.innerHTML = `<a class="page-link" href="#">${i}</a>`;

        pagination.append(page);
    };

    for (let j = 1; j < total_pages + 1; j++) {
      
        var page_button = document.getElementById('page' + j);
        page_button.addEventListener('click', () => {
            load_posts(type, j);
        });
    };
};

function new_post(userinfo) {

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
    });


    fetch('/get_posts/self')
    .then(response => response.json())
    .then(posts => {

        const post = posts[0];
        console.log(post);

        const card = document.createElement('div');
        card.className = 'card w-75 mx-auto new_post hello';
        card.id = `post${post.id}`;
        card.innerHTML = '';
        
        const card_body = document.createElement('div');
        card_body.className = 'card-body';
        card_body.innerHTML = '';
        

        const poster = document.createElement('h5');
        poster.className = 'card-title';
        poster.innerHTML = post.poster;

        const body = document.createElement('p');
        body.className = 'card-text';
        body.innerHTML = post.body;

        const timestamp = document.createElement('p');
        timestamp.className = 'card-text';
        timestamp.innerHTML = `<small class="text-muted">Just now</small>`;

        const likes_div = document.createElement('div');
        likes_div.className = 'likes_div';

        const like_counter = document.createElement('span');
        like_counter.className = 'like_counter align-top'
        like_counter.innerHTML = ` ${(post.likes).length}`;

        const like_icon = document.createElement('span');
        like_icon.className = 'material-icons-outlined';
        like_icon.innerHTML = 'favorite';

        like_counter.style = 'color: gray';
        like_icon.style = 'color: lightgray';

        like_icon.addEventListener('click', () => {
            
            console.log(`clicked like on ${post.id}`)
            
            // Run like post function
            like_post(post.id, like_icon, like_counter)
            
        });

        likes_div.append(like_icon);
        likes_div.append(like_counter);

        card_body.append(poster);
        card_body.append(body);
        card_body.append(timestamp);
        card_body.append(likes_div);

        card.append(card_body);
        posts_div.prepend(card);


    });
    
    return false;
};


async function load_posts(type, page) {

    posts_div = document.querySelector('#posts');
    posts_div.innerHTML = '';

    const userinfo = await get_userinfo();
    console.log(`user:${userinfo.username}`);

    // New Post
    // Listen for submission of new post form
    document.querySelector('#submit_new_post').onclick = () => {
        new_post(userinfo);
    };
    


    // Load Posts
    // GET request to /posts/<type>
    fetch(`/get_posts/${type}`)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(`print posts with type ${type}: page ${page}`);

        heading = document.querySelector('#heading');
        if (type == 'all') {
            heading.innerHTML = 'All Posts';
        } else if (type == 'following') {
            heading.innerHTML = 'Following'
        };

        let x = page * 10;
        var i = (page * 10) - 9;
        if (page * 10 > posts.length) {
            x = posts.length;
        };
        if (i >= x) {
            return false;
        }
        console.log(`i=${i}, x=${x}`);

        for (i; i < x; i++) {

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

        // Active page
        let pagebutton = document.getElementById(`page${page}`);
        pagebutton.className = 'page-item active';
        
    });

    return false;
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