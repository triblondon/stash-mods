# Stash modifications

This plugin fixes some annoyances I have with Atlassian Stash:

* **Keeps you logged in**: Stash has a very short login timeout.  The plugin sends an XHR every 2 minutes to keep you logged in.
* **Removed committer name from commit list**: The avatar is enough, the name is a waste of space
* **Shows tags in commit list**: Implements [STASH-2795](https://jira.atlassian.com/browse/STASH-2795)
