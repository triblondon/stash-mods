function main() {

	var apibase = location.pathname.replace(/^\/projects\/(\w+)\/repos\/([\w\-]+)(\/.*)?$/, '/rest/api/1.0/projects/$1/repos/$2');
	var $ = jQuery;

	/* Keep me logged in! */

	// Load the account page once every 2 minutes
	setInterval(function() {
		$.get('/account');
	}, 120000);

	function addTags() {
		var tbl = $('table.commits-table');
		if (!tbl.length) return;
		$.get(apibase+'/tags', function(tagdata) {
			var lookup = {};
			for (var i=0,s=tagdata.values.length; i<s; i++) {
				var sha = tagdata.values[i].latestChangeset;
				lookup[sha] = lookup[sha] || [];
				lookup[sha].push(tagdata.values[i].displayId);
			}
			var observer = new MutationObserver(modTable);
			modTable();

			function modTable() {
				console.log('Stashmods Chrome extension: Modifying commit table');
				observer.disconnect();
				$('.ft-tag').remove();
				tbl.find('.commit-row').each(function() {
					var sha = $(this).find('.changesetid').attr('href').replace(/^.*\/(\w+)\/?$/, '$1');
					if (lookup[sha]) {
						var span = $(this).find('.message span');
						if (lookup[sha].length === 1) {
							span.prepend('<div style="float:right;" class="ft-tag aui-lozenge">'+lookup[sha][0]+'</div>');
						} else {
							lookup[sha].forEach(function _add(tag) {
								span.after('<div style="float:right; margin: 2px;" class="ft-tag aui-lozenge">'+tag+'</div>');
							});
						}
					}
				});
				observer.observe(tbl.get(0), {subtree: true, childList: true});
			}
		});
	}

	function addRedmineLinks() {
		var commitMsgs = document.querySelectorAll('.commit-message, .commit-row .message');

		for (var i = 0, l = commitMsgs.length; i < l; i++) {
			var msg = commitMsgs[i];
			msg.innerHTML = msg.innerHTML.replace(/(redmine\s*#?(\d+))/i, '<a href="https://redmine.labs.ft.com/issues/$2">$1</a>')
		}
	}

	function removeAuthorNames() {
		var observer = new MutationObserver(avatarOnly);
		avatarOnly();
		function avatarOnly() {
			observer.disconnect();
			$('th.author').empty();
			$('.avatar-with-name > .aui-avatar').each(function() {
				$(this).parent().find('.secondary-link').empty().append(this);
			});
			observer.observe(document.body, {subtree: true, childList: true});
		}
	}

	$(function() {

		// Add tags to commit view
		addTags();

		// Convert Redmine references to links
		addRedmineLinks();

		// Remove author names - avatars are sufficient
		removeAuthorNames();
	});
}

// Run the script in the main document context, not in the extension sandbox
var scriptNode = document.createElement('script');
var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;

scriptNode.type = "text/javascript";
scriptNode.textContent = '(' + main.toString() + ')()';

target.appendChild(scriptNode);
