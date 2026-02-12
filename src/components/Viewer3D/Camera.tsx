import { observer } from 'mobx-react-lite';
import { CameraControls } from '@react-three/drei';

export const Camera = observer(() => {
//   const { design3DManager } = useMainContext();
//   const { cameraManager } = design3DManager;

  return (
    <CameraControls
      // makeDefault
      // minPolarAngle={Math.PI / 2}
      // maxPolarAngle={Math.PI / 2}
      // minDistance={0.5}
      // maxDistance={2}
      // ref={(camera) => {
      //   if (camera) {
      //     cameraManager.setCameraRef(camera);
      //   }
      // }}
    />
  );
});