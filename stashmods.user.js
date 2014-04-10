function main() {

	var apibase = location.pathname.replace(/^\/projects\/(\w+)\/repos\/([\w\-]+)(\/.*)?$/, '/rest/api/1.0/projects/$1/repos/$2');

	/* Keep me logged in! */

	// Load the account page once every 2 minutes
	setInterval(function() {
		jQuery.get('/account');
	}, 120000);


	/* Add tags to commit view */

	jQuery(function() {
		var tbl = jQuery('table.commits-table');
		if (!tbl.length) return;
		jQuery.get(apibase+'/tags', function(tagdata) {
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
				jQuery('.ft-tag').remove();
				tbl.find('.commit-row').each(function() {
					var sha = jQuery(this).find('.changesetid').attr('href').replace(/^.*\/(\w+)\/?$/, '$1');
					if (lookup[sha]) {
						var span = jQuery(this).find('.message span');
						if (lookup[sha].length === 1) {
							span.prepend('<div style="float:right;" class="ft-tag aui-lozenge">'+lookup[sha][0]+'</div>');
						} else {
							lookup[sha].forEach(function _add(tag) {
								span.after('<div style="float:right; margin: 2px;" class="ft-tag aui-lozenge">'+tag+'</div>');
							});
						}
					}
				});
				tbl.find('th.author').html('');
				tbl.find('.avatar-with-name').contents().filter(function() { return this.nodeType === 3; }).remove();
				observer.observe(tbl.get(0), {subtree: true, childList: true});
			}
		});
	});
}

// Run the script in the main document context, not in the extension sandbox
var scriptNode = document.createElement('script');
var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;

scriptNode.type = "text/javascript";
scriptNode.textContent = '(' + main.toString() + ')()';

target.appendChild(scriptNode);
