

xor dl,dl
mov [513h],dl
start:
mov dh,[513h]
test dh,dh
jz start

add ax,0x1d  
mov bx,ax
mov dl,[bx]
xor dl,dh
mov [bx],dl
mov cx,4
add cx,1
test cx,cx
jnz trap
int 3

trap:
jmp trap        