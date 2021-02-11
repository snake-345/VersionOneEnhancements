(function () {
	var options = JSON.parse(document.querySelector('body').dataset.options);

	window.addEventListener('load', function() {
		_showPullRequestsInfo();
	});
	document.addEventListener('voe.onFloatingGadgetShown', _showPullRequestsInfo);
	document.addEventListener('voe.openLightBox', _showPullRequestsInfo);
	document.addEventListener('voe.refresh', _showPullRequestsInfo);

	function _showPullRequestsInfo() {
		var id = document.querySelector('.asset-summary.Story .title-id, .asset-summary.Defect .title-id, .asset-summary.Epic .title-id');

		if (!id || document.querySelector('.pull-requests')) { return; }

		injectStyle(options.componentsUrl + 'showPullRequestInfo/styles.css');

		var pullRequests = document.createElement('div');
		var hr = document.createElement('div');

		pullRequests.classList.add('pull-requests');
		hr.classList.add('expander-divider');
		hr.style = 'width: 100%;';
		pullRequests.innerHTML = `
			<div class="pull-requests__title select_12">Pull requests:</div>
			<div style="background-image: url(https://www8.v1host.com/s/19.0.3.29/css/images/svg/loading-spin-888.svg); background-size: 16px 16px; width: 16px; height: 16px;"></div>`;

		var expanderDivider = document.querySelector('.asset-info .expander-divider');

		expanderDivider.parentNode.insertBefore(hr, expanderDivider);
		expanderDivider.parentNode.insertBefore(pullRequests, expanderDivider);

		_getPullRequests(id.innerText.trim())
			.then(function(data) {
				if (!data.length) {
					pullRequests.innerHTML = _generateEmptyHtml();
					return;
				}

				pullRequests.innerHTML = _generatePullRequestsHtml(data);
			})
			.catch(function(error) {
				pullRequests.innerHTML = _generateEmptyHtml();
				console.log(error);
			});
	}

	function _getPullRequests(id) {
		return fetch('https://bitbucket-pr-service.herokuapp.com/?id=' + id).then(function(response) {
			return response.json();
		});
	}

	function _generateEmptyHtml() {
		return `<div class="pull-requests__title select_12">Pull requests:</div>
				<span style="width: 25px; padding-left: 4px; color: #b7bcc4;">--</span>`;
	}

	function _generatePullRequestsHtml(pullRequests) {
		var template = `
			<div class="pull-requests__title select_12">Pull requests:</div>
			<table class="pull-requests__table">
				{pullRequests}
			</table>`;
		var pullRequestTemplate = `
			<tr class="pull-requests__info">
				<td class="pull-requests__rep-name"><a href="{url}">{repName}</a></td>
				<td class="pull-requests__branch">{source} → {destination}</td>
				<td class="pull-requests__reviewers">{reviewers}</td>
				<td class="pull-requests__status pull-requests__status_{status}">{status}</td>
			</tr>`;
		var reviewerTemplate = '<span class="pull-requests__reviewer pull-requests__reviewer_{reviewerStatus}">{reviewer}</span>';

		return template.replace('{pullRequests}', pullRequests.reduce(function(html, pullRequest) {
			var reviewersHtml = '';

			if (pullRequest.reviewers && pullRequest.reviewers.length) {
				reviewersHtml = pullRequest.reviewers.sort(function(a, b) {
					if (!a.approved && b.approved) {
						return 1;
					}

					if (!b.approved && a.approved) {
						return -1;
					}

					return 0;
				}).reduce(function(revHtml, reviewer) {
					return revHtml + ' ' + reviewerTemplate
						.replace('{reviewer}', escapeHTML(reviewer.name))
						.replace('{reviewerStatus}', reviewer.approved ? 'approved' : 'not-approved');
				}, '');
			}

			return html + pullRequestTemplate
				.replace('{url}', escapeHTML(pullRequest.url))
				.replace('{repName}', escapeHTML(pullRequest.repository_name))
				.replace('{source}', escapeHTML(pullRequest.branch_name))
				.replace('{destination}', escapeHTML(pullRequest.destination))
				.replace('{reviewers}', reviewersHtml)
				.replace(/{status}/g, escapeHTML(pullRequest.status));
		}, ''));
	}

	function escapeHTML(text) {
		return text
			.replace(/&/g,'&amp;')
			.replace(/</g,'&lt;')
			.replace(/>/g,'&gt;')
			.replace('/\'/g', '&#39;')
			.replace('/\"/g', '&#34;');
	}
})();
