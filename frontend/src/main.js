function pageShow(pageId, noHashUpdate) {
	const pages = document.querySelectorAll('.page');
	for (const page of pages) {
		page.style.display = 'none';
	}
	document.getElementById(pageId).style.display = 'block';

	if (!noHashUpdate) {
		if (pageId === 'login') {
			window.location.hash = '#login';
		} else if (pageId === 'feed') {
			window.location.hash = '#feed';
		}
	}
}

document.querySelector('#login form').addEventListener('submit', function(evt) {
	evt.preventDefault();

	const email = evt.target.email.value;
	const password = evt.target.password.value;

	fetch('http://localhost:5005/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password
			}),
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then(result => {
					throw new Error(result.error);
				});
			}
		})
		.then(result => {
			localStorage.setItem('token', result.token);
			localStorage.setItem('userId', result.userId);
			loadFeed(result.token);
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred during login. Please try again.');
		});
});

document.querySelector('#register form').addEventListener('submit', function(evt) {
	evt.preventDefault();

	const email = evt.target.email.value;
	const username = evt.target.username.value;
	const password = evt.target.password.value;
	const confirm_password = evt.target.confirm_password.value;

	if (password !== confirm_password) {
		alert('Passwords do not match. Please try again.');
		return;
	}

	fetch('http://localhost:5005/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				username,
				password
			}),
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then(result => {
					throw new Error(result.error);
				});
			}
		})
		.then(result => {
			localStorage.setItem('token', result.token);
			localStorage.setItem('userId', result.userId);
			loadFeed(result.token);
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred during registration. Please try again.');
		});
});

document.querySelector('#toRegister').addEventListener('click', function(evt) {
	evt.preventDefault();
	pageShow('register');
});

document.querySelector('#toLogin').addEventListener('click', function(evt) {
	evt.preventDefault();
	pageShow('login');
});

//** time format **//
function getElapsedTime(postedAt) {
	const now = new Date();
	const postedDate = new Date(postedAt);
	const elapsedTimeMs = now - postedDate;
	const elapsedTimeMin = elapsedTimeMs / 60000;

	if (elapsedTimeMin < 60) {
		const hours = Math.floor(elapsedTimeMin / 60);
		const minutes = Math.floor(elapsedTimeMin % 60);
		return `${hours} hours ${minutes} minutes ago`;
	} else {
		const day = postedDate.getDate();
		const month = postedDate.getMonth() + 1;
		const year = postedDate.getFullYear();
		return `${day}/${month}/${year}`;
	}
}
function del(index,id,Id) {
	let token =localStorage.getItem('token')
	fetch('http://localhost:5005/delComments?index='+index+"&id="+id+"&Id="+Id, {
			method: 'GET',
			data:JSON.stringify({
					index,
					id,
					Id
				}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then(result => {
					throw new Error(result.error);
				});
			}
		})
		.then(jobs => {
			alert("删除成功")
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred while loading the feed. Please try again.');
		});
}
//** feed job list **//
function loadFeed(token) {
	fetch('http://localhost:5005/job/feed?start=0', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then(result => {
					throw new Error(result.error);
				});
			}
		})
		.then(jobs => {
			let userId = localStorage.getItem('userId')
			console.log(jobs, "jobs")
			let html = ''
			
			for (var i = 0; i < jobs[0].comments.length; i++) {
				if (userId == jobs[0].comments[i].userId) {
					html +=
						`<div>${jobs[0].comments[i].userName}:${jobs[0].comments[i].comment}</div><button class="layui-btn layui-btn-xs layui-btn-danger" onclick='del(${i},${jobs[0].creatorId},${jobs[0].id})'>删除</button>`
				} else {
					html += `<div>${jobs[0].comments[i].userName}:${jobs[0].comments[i].comment}</div>`
				}
			}
			document.getElementById('myComId').innerText= jobs[0].id
			document.getElementById('myCom').innerHTML = html
			displayJobs(jobs);
			pageShow('feed');
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred while loading the feed. Please try again.');
		});
}


function displayJobs(jobs) {
	const feedContainer = document.querySelector('.feed-container');
	feedContainer.textContent = '';

	jobs.reverse().forEach(job => {
		const jobElement = document.createElement('div');
		jobElement.classList.add('feed-item');
		const elapsedTime = getElapsedTime(job.createdAt);

		const postedBy = document.createElement('p');
		postedBy.textContent = `Posted by: ${job.creatorId}`;
		jobElement.appendChild(postedBy);

		const postedAt = document.createElement('p');
		postedAt.textContent = `Posted at: ${elapsedTime}`;
		jobElement.appendChild(postedAt);

		const img = document.createElement('img');
		img.src = job.image;
		img.alt = 'Job image';
		img.width = 200;
		img.height = 200;
		jobElement.appendChild(img);

		const title = document.createElement('h3');
		title.textContent = job.title;
		jobElement.appendChild(title);

		const startingDate = document.createElement('p');
		startingDate.textContent = `Starting date: ${job.start}`;
		jobElement.appendChild(startingDate);

		const likes = document.createElement('p');
		const likeCount = document.createElement('span');
		likeCount.classList.add('like-count');
		likeCount.textContent = job.likes.length;
		likes.textContent = 'Likes: ';
		likes.appendChild(likeCount);
		jobElement.appendChild(likes);

		const likeButton = document.createElement('button');
		likeButton.classList.add('like-button');
		likeButton.dataset.jobId = job._id;
		likeButton.textContent = 'Like';
		jobElement.appendChild(likeButton);

		const description = document.createElement('p');
		description.textContent = job.description;
		jobElement.appendChild(description);

		const toggleLikesButton = document.createElement('button');
		toggleLikesButton.classList.add('toggle-likes');
		toggleLikesButton.dataset.jobId = job._id;
		toggleLikesButton.textContent = 'Show Likes';
		jobElement.appendChild(toggleLikesButton);

		const likesList = document.createElement('div');
		likesList.classList.add('likes-list');
		likesList.dataset.jobId = job._id;
		likesList.style.display = 'none';
		job.likes.forEach(like => {
			const likeItem = document.createElement('p');
			likeItem.textContent = like.userName;
			likesList.appendChild(likeItem);
		});

		//** liked job list and comments **//

		jobElement.appendChild(likesList);
		const toggleCommentsButton = document.createElement('button');
		toggleCommentsButton.classList.add('toggle-comments');
		toggleCommentsButton.dataset.jobId = job._id;
		toggleCommentsButton.textContent = 'Show Comments';
		jobElement.appendChild(toggleCommentsButton);

		const commentsList = document.createElement('div');
		commentsList.classList.add('comments-list');
		commentsList.dataset.jobId = job._id;
		commentsList.style.display = 'none';
		job.comments.forEach(comment => {
			const commentItem = document.createElement('p');
			commentItem.textContent = `${comment.userName}: ${comment.comment}`;
			commentsList.appendChild(commentItem);
		});
		jobElement.appendChild(commentsList);

		feedContainer.appendChild(jobElement);
	});
	const toggleLikesButtons = document.querySelectorAll('.toggle-likes');
	for (const toggleLikesButton of toggleLikesButtons) {
		toggleLikesButton.addEventListener('click', function(evt) {
			evt.preventDefault();
			const jobId = evt.target.dataset.jobId;
			const likesList = document.querySelector(`.likes-list[data-job-id="${jobId}"]`);
			likesList.style.display = likesList.style.display === 'none' ? 'block' : 'none';
		});
	}

	const toggleCommentsButtons = document.querySelectorAll('.toggle-comments');
	for (const toggleCommentsButton of toggleCommentsButtons) {
		toggleCommentsButton.addEventListener('click', function(evt) {
			evt.preventDefault();
			const jobId = evt.target.dataset.jobId;
			const commentsList = document.querySelector(`.comments-list[data-job-id="${jobId}"]`);
			commentsList.style.display = commentsList.style.display === 'none' ? 'block' : 'none';
		});
	}


	const likeButtons = document.querySelectorAll('.like-button');
	for (const likeButton of likeButtons) {
		likeButton.addEventListener('click', function(evt) {
			event.preventDefault();
			const jobId = evt.target.dataset.jobId;
			fetch(`http://localhost:5005/job/like`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({
						jobId
					}),
				})
				.then(response => {
					if (response.ok) {
						return loadFeed(localStorage.getItem('token'));
					} else {
						return response.json().then(result => {
							throw new Error(result.error);
						});
					}
				})
				.catch(error => {
					console.error('Error:', error);
					alert('An error occurred while liking the job. Please try again.');
				});
		});
	}
}
let pageIndex = 0;

document.getElementById('loadMore').addEventListener('click', function(evt) {
	evt.preventDefault();
	pageIndex += 5;

	fetch(`http://localhost:5005/job/feed?start=${pageIndex}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
			},
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then(result => {
					throw new Error(result.error);
				});
			}
		})
		.then(jobs => {
			displayJobs(jobs);
		})
		.catch(error => {
			console.error('Error:', error);
			alert('An error occurred while loading more jobs. Please try again.');
		});
});

window.addEventListener('DOMContentLoaded', () => {
	const token = localStorage.getItem('token');
	const userId = localStorage.getItem('userId');
	const hash = window.location.hash;

	if (token && userId && hash === '#feed') {
		loadFeed(token).then(() => {
			pageShow('feed', true);
		});
	} else {
		pageShow('login', true);
	}
});

function showProfile(userId) {
	const profileInfo = document.querySelector('.profile-info');
	const profileJobs = document.querySelector('.profile-jobs');
	const profileWatchers = document.querySelector('.profile-watchers');
	const editProfileButton = document.getElementById('edit-profile');
	const watchUnwatchButton = document.getElementById('watch-unwatch');

	// Get user info
	fetch(`/user/${userId}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Error loading user');
			}
			return response.json();
		})
		.then(data => {
			profileInfo.textContent = JSON.stringify(data);
			if (userId === loggedInUserId) {
				editProfileButton.hidden = false;
			} else {
				editProfileButton.hidden = true;
			}
			watchUnwatchButton.hidden = userId === loggedInUserId;
			watchUnwatchButton.textContent = data.watching ? 'Unwatch' : 'Watch';
			watchUnwatchButton.dataset.userId = userId;
			watchUnwatchButton.dataset.watching = data.watching;
		})
		.catch(error => {
			showErrorPopup(error.message);
		});

	// Get user jobs
	fetch(`/user/${userId}/jobs`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Error loading jobs');
			}
			return response.json();
		})
		.then(data => {
			profileJobs.innerHTML = '';
			data.jobs.forEach(job => {
				const jobEl = createJobElement(job);
				profileJobs.appendChild(jobEl);
			});
		})
		.catch(error => {
			showErrorPopup(error.message);
		});

	// Get user watchers
	fetch(`/user/${userId}/watchers`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Error loading watchers');
			}
			return response.json();
		})
		.then(data => {
			profileWatchers.innerHTML = '';
			data.watchers.forEach(watcher => {
				const watcherEl = document.createElement('a');
				watcherEl.textContent = watcher.name;
				watcherEl.href = `#profile-${watcher.id}`;
				watcherEl.addEventListener('click', () => {
					showProfile(watcher.id);
				});
				profileWatchers.appendChild(watcherEl);
			});
		})
		.catch(error => {
			showErrorPopup(error.message);
		});

	showSection('profile');
}

function editProfile() {
	const editEmail = document.getElementById('edit-email');
	const editName = document.getElementById('edit-name');
	const editPassword = document.getElementById('edit-password');
	const editImage = document.getElementById('edit-image');

	fetch(`/user/${loggedInUserId}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Error loading user');
			}
			return response.json();
		})
		.then(data => {
			editEmail.value = data.email;
			editName.value = data.name;
			editPassword.value = '';
			editImage.value = data.image;
		})
		.catch(error => {
			showErrorPopup(error.message);
		});

	showSection('edit-profile-section');
}

function updateProfile(event) {
	event.preventDefault();

	const editEmail = document.getElementById('edit-email');
	const editName = document.getElementById('edit-name');
	const editPassword = document.getElementById('edit-password');
	const editImage = document.getElementById('edit-image');

	const body = {
		email: editEmail.value,
		name: editName.value,
		password: editPassword.value,
		image: editImage.value,
	};

	fetch(`/user/${loggedInUserId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Error updating profile');
			}
			showProfile(loggedInUserId);
		})
		.catch(error => {
			showErrorPopup(error.message);
		});
}

function toggleWatch() {
	const userId = this.dataset.userId;
	const watching = this.dataset.watching === 'true';
	const method = watching ? 'DELETE' : 'PUT';

	fetch(`/user/${userId}/watch`, {
			method
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Error toggling watch');
			}
			showProfile(userId);
		})
		.catch(error => {
			showErrorPopup(error.message);
		});
}

// Add event listeners
document.getElementById('edit-profile').addEventListener('click', editProfile);
document.getElementById('edit-profile-form').addEventListener('submit', updateProfile);
document.getElementById('watch-unwatch').addEventListener('click', toggleWatch);


// Add Job
document.getElementById('add-job-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const title = document.getElementById('job-title').value;
	const startDate = document.getElementById('job-start-date').value;
	const description = document.getElementById('job-description').value;
	const image = document.getElementById('job-image').value;

	// Call POST /job API with the form data
});

// Update Job
document.getElementById('update-job-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const jobId = document.getElementById('update-job-id').value;
	const title = document.getElementById('update-job-title').value;
	const startDate = document.getElementById('update-job-start-date').value;
	const description = document.getElementById('update-job-description').value;
	const image = document.getElementById('update-job-image').value;

	// Call PUT /job API with the form data and jobId
});

// Delete Job
document.getElementById('delete-job').addEventListener('click', () => {
	constjobId = document.getElementById('update-job-id').value;

	// Call DELETE /job API with jobId
});

// Add Comment
document.getElementById('add-comment-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const jobId = document.getElementById('comment-job-id').value;
	const commentText = document.getElementById('comment-text').value;

	// Call POST /job/comment API with the jobId and commentText
});
