import {defineStore, acceptHMRUpdate} from 'pinia';

export const useRootStore = defineStore({
    id: 'root',
    state: () => ({
        assets: null,
        active_item:null,
        assets_is_fetching: true,
        count: 0,
        sources: [],
    }),
    getters: {},
    actions: {
        //--------------------------------------
        onLoad(){
            window.ipcRenderer.on('sources', (event, arg) => {
                this.sources = arg;
                console.log('sources', arg);
            });
        },
        //-----------------------------------------
        takeScreenshot(source)
        {
            window.ipcRenderer.send('take-screenshot', source);
        }
    },
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}