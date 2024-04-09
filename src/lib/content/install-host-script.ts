import { joinRelativeURL } from 'ufo';
import hostScriptURL from 'url:~/injectables/host-script';

function installScript(scriptURL) {
	const script = document.createElement('script');
	script.type = 'module';
	script.src = scriptURL;
	document.head.appendChild(script);
}

export function installHostScript() {
	return installScript(joinRelativeURL(hostScriptURL));
}
