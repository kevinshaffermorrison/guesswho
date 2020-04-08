export default {
    methods: {
        async getRandomName({spaces=false}){
            var request = new XMLHttpRequest();
            request.open('GET', 'https://frightanic.com/goodies_content/docker-names.php', false);  // `false` makes the request synchronous
            request.send(null);
            if (request.status === 200) {
                let name = request.responseText.replace('\n','');
                if (spaces){
                    return this.titleCase(name.replace('_',' '));
                }
                else {
                    return this.titleCase(name.replace('_',' ')).replace(' ','');
                }
            }
        },
        titleCase(str) {
            return str.toLowerCase().split(' ').map(function(word) {
                return word.replace(word[0], word[0].toUpperCase());
            }).join(' ');
        },
        
    }
}

