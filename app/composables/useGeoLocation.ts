interface IPResponse {
  ipinfo: {
    text: string;
  };
  ipdata: {
    info1: string;
  };
}

export const useGeoLocation = async () => {
  try {
    const config = useRuntimeConfig();
    const data = await $fetch<IPResponse>(config.public.ipDataApiUrl, {
      timeout: 5000,
      retry: 2,
    });

    if (!data.ipinfo?.text || !data.ipdata?.info1) {
      return {
        ip: "未知",
        location: "地球",
      };
    }

    return {
      ip: data.ipinfo.text,
      location: data.ipdata.info1,
    };
  } catch (error) {
    return {
      ip: "未知",
      location: "地球",
    };
  }
};
