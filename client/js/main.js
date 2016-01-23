function _(e) { return document.getElementById(e);}
function _tag(e) { return document.getElementsByTagName(e); }
function _class(e) { return document.getElementsByClassName(e); }
function __(e) { return document.createElement(e); }
function __c(e, cl) { var r = __(e); r.className = cl; return r; }

var user = localStorage.getItem('user');
var activity = null;
var s = io.connect('104.155.41.137:8042');

function greetings(n)
{
	_('gname').innerHTML = n;
	$("#greetings").css({opacity: 1});
	window.setTimeout(function(){
		$("#greetings").animate({opacity: 0});
	}, 1500);
}
function logout() {
	localStorage.clear();
}

function addPostit() {
	if (activity == 'editing')
	{
		alert('finish editing first !');
	}
	else
	{
		activity = 'editing';
		var titre = __('input');
		titre.type = 'text';
		titre.name = 'titre';
		titre.className = 'form-control';
		titre.placeholder = 'Titre';
		titre.autocomplete = 'off';
		var cont = __('textarea');
		cont.className = 'form-control';
		cont.name = 'content';
		cont.placeholder = 'Text';
		cont.style.height = '100%';
		var ok = __('button');
		ok.type = 'submit';
		ok.innerHTML = 'Ajouter';
		ok.className = 'btn btn-success';
		var d = __c('div', 'postit');
		var f = __('form');
		f.addEventListener('submit', function(e) {
			console.log('submitting data :');
			e.preventDefault();
			var data = $(this).serializeObject();
			data.user = user;
			data.ts = Math.floor(Date.now() / 1000);
			console.dir(data);
			s.emit('save', data);
			_('bDest').removeChild(d);
			activity = null;
		});
		f.appendChild(titre);
		f.appendChild(cont);
		f.appendChild(ok);
		d.appendChild(f);
		titre.focus();
		_('bDest').appendChild(d);
	}
}
function editPostit(el) {
	var postit = el.parentNode;
	if (postit.dataset.readonly == 'readonly')
	{
		alert("Ce post-it est déjà en cours d'édition");
		return false;
	}
	s.emit('editing', {id : postit.dataset.id, user : user});
	postit.innerHTML = '';
	activity = 'editing';
	var titre = __('input');
	titre.type = 'text';
	titre.name = 'titre';
	titre.className = 'form-control';
	titre.placeholder = 'Titre';
	titre.autocomplete = 'off';
	titre.value = postit.dataset.titre;
	var cont = __('textarea');
	cont.className = 'form-control';
	cont.name = 'content';
	cont.placeholder = 'Text';
	cont.style.height = '100%';
	cont.innerHTML = postit.dataset.content;
	var ok = __('button');
	ok.type = 'submit';
	ok.innerHTML = 'Sauvegarder';
	ok.className = 'btn btn-success';
	var d = postit;
	var f = __('form');
	f.addEventListener('submit', function(e) {
		console.log('submitting data :');
		e.preventDefault();
		var data = $(this).serializeObject();
		data.user = user;
		data.ts = Math.floor(Date.now() / 1000);
		data.id = postit.dataset.id;
		console.dir(data);
		s.emit('saveEdit', data);
		d.dataset.titre = data.titre;
		d.dataset.content = data.content;
		d.innerHTML = '<h2>'+data.titre+'</h2>';
		d.innerHTML += '<div class="content">'+data.content+'</div>';
		var edit = __('button');
		edit.innerHTML = 'Editer';
		edit.addEventListener('click', function() {
			editPostit(this);
		});
		d.appendChild(edit);
		activity = null;
	});
	f.appendChild(titre);
	f.appendChild(cont);
	f.appendChild(ok);
	d.appendChild(f);
	titre.focus();
}
window.onload = function() {
	if (user == null || user == 'null')
	{
		user = prompt('Qui êtes-vous ?');
		localStorage.setItem('user', user);
	}
	greetings(user);
};
s.on('init', function(e) {
	console.dir(e);
	for (var i = 0; i < e.length; i++)
	{
		var postit = __c('div', 'postit');
		postit.id = 'postit-'+e[i].id.toString();
		postit.dataset.id = e[i].id;
		postit.dataset.titre = e[i].titre;
		postit.dataset.content = e[i].content;
		postit.innerHTML = '<h2>'+e[i].titre+'</h2>';
		postit.innerHTML += '<div class="content">'+e[i].content+'</div>';
		var edit = __('button');
		edit.innerHTML = 'Editer';
		edit.addEventListener('click', function() {
			editPostit(this);
		});
		postit.appendChild(edit);
		_('bDest').appendChild(postit);
	}
});
s.on('added', function(e) {
	var postit = __c('div', 'postit');
	postit.id = 'postit-'+e.id.toString();
	postit.dataset.id = e.id;
	postit.dataset.titre = e.titre;
	postit.dataset.content = e.content;
	postit.innerHTML = '<h2>'+e.titre+'</h2>';
	postit.innerHTML += '<div class="content">'+e.content+'</div>';
	var edit = __('button');
	edit.innerHTML = 'Editer';
	edit.addEventListener('click', function() {
		editPostit(this);
	});
	postit.appendChild(edit);
	_('bDest').appendChild(postit);
});
s.on('editing', function(e) {
	var id = e.id;
	var p = _('postit-'+id.toString());
	var msg = __('p');
	msg.innerHTML = e.user+' is editing';
	p.appendChild(msg);
	p.dataset.readonly = 'readonly';
	p.classList.add('readonly');
});
s.on('finished_edit', function(e) {
	console.dir(e);
	var postit = _('postit-'+e.id.toString());
	postit.getElementsByTagName('h2')[0].innerHTML = e.titre;
	postit.getElementsByClassName('content')[0].innerHTML = e.content;
	postit.dataset.readonly = '';
	postit.classList.remove('readonly');
	var msg = postit.getElementsByTagName('p')[0];
	postit.removeChild(msg);
});
