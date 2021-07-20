document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#following')) {
        const following = document.querySelector('#following');
        following.addEventListener('click', () => load_posts('following', 1));
    };

    // Message
    const message = document.querySelector('#message');

    var pathname = window.location.pathname.split('/')[1];
    console.log(`pathname: ${pathname}`);
    if (pathname == 'user') {
        // Load user profile page
        var profile = window.location.pathname.split('/')[2];
        load_posts(profile, 1);
    } else {
        // Load all posts by default
        load_posts('all', 1);
    };

    

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

function new_post() {

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

        fetch('/get_posts/self')
        .then(response => response.json())
        .then(posts => {
    
            const post = posts[0];
            console.log(post);
            const post_id = post.id;
            const post_body = post.body;
    
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

            const edit_break = document.createElement('small');
            edit_break.className = 'text-muted';
            edit_break.innerHTML = " | ";
            
            const edit_link = document.createElement('a');
            edit_link.href = "#";

            const edit_button = document.createElement('small');
            edit_button.className = `text-muted edit_button_${post_id}`;
            edit_button.href = '#';
            edit_button.innerHTML = 'Edit';

            edit_button.addEventListener('click', () => {

                console.log(`clicked edit on ${post_id} with body: ${post_body}`);

                // Run edit post function
                edit_post(body, post_id, post_body);
                
            });

            edit_link.append(edit_button);

            timestamp.append(edit_break);
            timestamp.append(edit_link);
    
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

    });
    
    return false;
};


async function load_posts(type, page) {

    posts_div = document.querySelector('#posts');
    posts_div.innerHTML = '';

    let userinfo = await get_userinfo();
    console.log(userinfo);
    if (userinfo.message == "User not logged in.") {
        userinfo = undefined;
        console.log(`userinfo is now: ${userinfo}`);
    }


    // New Post
    if (document.getElementById('new_post')) {
        // Listen for submission of new post form
        document.querySelector('#submit_new_post').onclick = () => {
            new_post(userinfo);
            document.querySelector('#new_post_body').value = '';
        };
    };
    
    // Follower count
    if (document.getElementById('follower_count')) {
        
        const follower_count = document.getElementById('follower_count');
        fetch(`/followers/${type}`)
        .then(response => response.json())
        .then(result => {
            
            console.log(result.count);

            follower_count.innerHTML = result.count;

        });

    };

    // Follow button
    if (document.getElementById('follow_button')) {
        
        const follow_button = document.getElementById('follow_button'); 
        console.log(`following: ${userinfo.following}`);
        if (userinfo.following.includes(type)) {

            follow_button.className = 'btn btn-danger align-top';
            follow_button.innerHTML = '<span class="material-icons align-middle" style="font-size: 19px;">how_to_reg</span><a>Following</a>';

        } else {

            follow_button.className = 'btn btn-outline-danger align-top';
            follow_button.innerHTML = 'Follow';

        };

        follow_button.addEventListener('click', () => {
            fetch(`/follow/${type}`)
            .then(response => response.json())
            .then(result => {

                console.log(result.message);

                let current_count = parseInt(document.getElementById('follower_count').innerHTML);
               
                if (result.message == "User followed.") {
                    follow_button.className = 'btn btn-danger align-top';
                    follow_button.innerHTML = '<span class="material-icons align-middle" style="font-size: 19px;">how_to_reg</span><a>Following</a>';
                    current_count++;
                    follower_count.innerHTML = current_count;
                    
                } else if (result.message == "User unfollowed.") {
                    follow_button.className = 'btn btn-outline-danger align-top';
                    follow_button.innerHTML = 'Follow';
                    current_count--;
                    follower_count.innerHTML = current_count;
                };
            });
            return false;
        });
    
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
        let i = (page * 10) - 10;
        if (page * 10 > posts.length) {
            x = posts.length;
        };
        if (i >= x) {
            return false;
        }
        console.log(`i=${i}, x=${x}`);

        for (i; i < x; i++) {

            let post_id = posts[i].id;
            let post_body = posts[i].body;

            const card = document.createElement('div');
            card.className = 'card w-75 mx-auto';
            card.id = `post${i}`;
            card.innerHTML = '';
            
            const card_body = document.createElement('div');
            card_body.className = 'card-body';
            card_body.innerHTML = '';
            

            const poster = document.createElement('h5');
            poster.className = 'card-title';
            poster.innerHTML = `<a href="/user/${posts[i].poster}">${posts[i].poster}</a>`;

            poster.addEventListener('click', () => {
                
            });

            const body = document.createElement('p');
            body.className = 'card-text';
            body.innerHTML = post_body;

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

            // If user is logged in
            if (userinfo !== undefined) {

                // Edit if user is poster
                if (userinfo.username == posts[i].poster) {

                    const edit_break = document.createElement('small');
                    edit_break.className = 'text-muted';
                    edit_break.innerHTML = " | ";
                    
                    const edit_link = document.createElement('a');
                    edit_link.href = "#";

                    const edit_button = document.createElement('small');
                    edit_button.className = `text-muted edit_button_${post_id}`;
                    edit_button.href = '#';
                    edit_button.innerHTML = 'Edit';

                    edit_button.addEventListener('click', () => {

                        console.log(`clicked edit on ${post_id} with body: ${post_body}`);

                        // Run edit post function
                        edit_post(body, post_id, post_body);
                        
                    });

                    edit_link.append(edit_button);

                    timestamp.append(edit_break);
                    timestamp.append(edit_link);
                };           

                if (posts[i].likes.includes(userinfo.username)) {
                    
                    console.log(`POST${i} ID:${posts[i].id} already LIKED.`)
                    like_counter.style = 'color: red';
                    like_icon.style = 'color: red';

                } else {

                    console.log(`POST${i} ID:${posts[i].id} NOT LIKED.`)
                    like_counter.style = 'color: gray';
                    like_icon.style = 'color: lightgray';
                }

                like_icon.addEventListener('click', () => {
                    
                    console.log(`clicked like on ${post_id}`)
                    
                    // Run like post function
                    like_post(post_id, like_icon, like_counter)
                    
                });

            };
            

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

function edit_post(body, post_id, post_body) {

    const edit_form = document.createElement('form');
                    
    const edit_form_group = document.createElement('div');
    edit_form_group.className = 'form-group';

    const edit_form_textarea = document.createElement('textarea');
    edit_form_textarea.className = "form-control";
    edit_form_textarea.rows = "2";
    edit_form_textarea.value = post_body;

    const save_edit = document.createElement('button');
    save_edit.type = "submit";
    save_edit.className = "btn btn-primary";
    save_edit.innerHTML = 'Save'
    

    edit_form_group.append(edit_form_textarea);
    edit_form.append(edit_form_group);
    edit_form.append(save_edit);
    body.innerHTML = '';
    body.append(edit_form);


    edit_form.addEventListener('submit', () => {
        
        const edit_body = edit_form_textarea.value;

        fetch(`/edit_post/${post_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                edit_body: edit_body
            })
        })
        .then(response => response.json())
        .then(result => {

            console.log(result);
            body.innerHTML = edit_body;

        });
        
        return false;
    });
}